import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

type ImportType = 'clients' | 'employees';

interface ParsedRow {
  [key: string]: any;
  _rowIndex?: number;
  _errors?: string[];
}

export function QuickDataUpload() {
  const [importType, setImportType] = useState<ImportType>('clients');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = async (file: File): Promise<ParsedRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          let rows: ParsedRow[] = [];

          if (file.name.endsWith('.csv')) {
            const text = data as string;
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              reject(new Error('CSV file must have at least a header row and one data row'));
              return;
            }

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            rows = lines.slice(1).map((line, index) => {
              const values = line.split(',').map(v => v.trim());
              const row: ParsedRow = { _rowIndex: index + 2 };
              headers.forEach((header, i) => {
                row[header] = values[i] || '';
              });
              return row;
            });
          } else {
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            if (jsonData.length < 2) {
              reject(new Error('Excel file must have at least a header row and one data row'));
              return;
            }

            const headers = jsonData[0].map((h: any) => String(h).toLowerCase().trim());
            rows = jsonData.slice(1).map((rowData, index) => {
              const row: ParsedRow = { _rowIndex: index + 2 };
              headers.forEach((header, i) => {
                row[header] = rowData[i] || '';
              });
              return row;
            });
          }

          resolve(rows.filter(row => Object.values(row).some(v => v !== '' && v !== null)));
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const validateData = (data: ParsedRow[], type: ImportType): { valid: ParsedRow[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: ParsedRow[] = [];

    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      const rowNum = row._rowIndex || index + 2;

      if (type === 'clients') {
        if (!row.company_name && !row['company name']) {
          rowErrors.push('Missing company_name');
        }
        if (!row.contact_name && !row['contact name']) {
          rowErrors.push('Missing contact_name');
        }
        if (!row.email) {
          rowErrors.push('Missing email');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          rowErrors.push('Invalid email format');
        }
        if (!row.client_type && !row['client type']) {
          rowErrors.push('Missing client_type');
        } else {
          const clientType = (row.client_type || row['client type'] || '').toLowerCase();
          if (!['brand_owner', 'wholesaler', '3p_seller'].includes(clientType)) {
            rowErrors.push(`Invalid client_type: ${clientType}`);
          }
        }
      } else if (type === 'employees') {
        if (!row.name) {
          rowErrors.push('Missing name');
        }
        if (!row.email) {
          rowErrors.push('Missing email');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          rowErrors.push('Invalid email format');
        }
        if (!row.role) {
          rowErrors.push('Missing role');
        }
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNum}: ${rowErrors.join(', ')}`);
        row._errors = rowErrors;
      } else {
        valid.push(row);
      }
    });

    return { valid, errors };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast.error('Please select a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setIsProcessing(true);

    try {
      const data = await parseFile(selectedFile);
      const validated = validateData(data, importType);
      setParsedData(validated.valid);
      setErrors(validated.errors);
      
      if (validated.errors.length > 0) {
        toast.warning(`Found ${validated.errors.length} validation errors`);
      } else {
        toast.success(`Successfully parsed ${validated.valid.length} rows`);
      }
    } catch (error) {
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFile(null);
      setParsedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    setIsImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      if (importType === 'clients') {
        for (const row of parsedData) {
          try {
            const clientData: any = {
              company_name: row.company_name || row['company name'] || '',
              contact_name: row.contact_name || row['contact name'] || '',
              email: row.email || '',
              client_type: (row.client_type || row['client type'] || '').toLowerCase(),
              health_score: parseInt(row.health_score || row['health score'] || '75'),
              mrr: parseFloat(row.mrr || row.mrr || '0'),
              package: row.package || row.package || 'Standard',
            };

            const { data: existing } = await supabase
              .from('clients')
              .select('id')
              .eq('email', clientData.email)
              .single();

            if (existing) {
              const { error } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', existing.id);
              
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('clients')
                .insert([clientData]);
              
              if (error) throw error;
            }
            successCount++;
          } catch (error: any) {
            const rowNum = row._rowIndex || 'unknown';
            errors.push(`Row ${rowNum}: ${error.message || 'Failed to import'}`);
          }
        }
      } else if (importType === 'employees') {
        for (const row of parsedData) {
          try {
            const employeeData: any = {
              name: row.name || '',
              email: row.email || '',
              role: row.role || 'employee',
            };

            const { data: existing } = await supabase
              .from('employees')
              .select('id')
              .eq('email', employeeData.email)
              .single();

            if (existing) {
              const { error } = await supabase
                .from('employees')
                .update(employeeData)
                .eq('id', existing.id);
              
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('employees')
                .insert([employeeData]);
              
              if (error) throw error;
            }
            successCount++;
          } catch (error: any) {
            const rowNum = row._rowIndex || 'unknown';
            errors.push(`Row ${rowNum}: ${error.message || 'Failed to import'}`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} ${importType}`);
      }
      if (errors.length > 0) {
        toast.error(`Failed to import ${errors.length} rows`);
        console.error('Import errors:', errors);
      }

      setFile(null);
      setParsedData([]);
      setErrors([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    let template: any[][] = [];
    
    if (importType === 'clients') {
      template = [
        ['company_name', 'contact_name', 'email', 'client_type', 'health_score', 'mrr', 'package'],
        ['Acme Corp', 'John Doe', 'john@acme.com', 'brand_owner', '85', '5000', 'Standard'],
      ];
    } else {
      template = [
        ['name', 'email', 'role'],
        ['Jane Smith', 'jane@amzdudes.com', 'employee'],
      ];
    }

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${importType}_template.xlsx`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Quick Data Upload
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Select 
            value={importType} 
            onValueChange={(value) => {
              setImportType(value as ImportType);
              setFile(null);
              setParsedData([]);
              setErrors([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            disabled={isProcessing || isImporting}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue>
                {importType === 'clients' ? 'Clients' : 'Employees'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="employees">Employees</SelectItem>
            </SelectContent>
          </Select>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing || isImporting}
            className="gap-2"
          >
            {file ? (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Choose File
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={downloadTemplate}
            className="gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Template
          </Button>

          {parsedData.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={isImporting || errors.length > 0}
              className="gap-2"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Import {parsedData.length}
                </>
              )}
            </Button>
          )}
        </div>

        {isProcessing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Processing file...</AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errors.length} validation error{errors.length > 1 ? 's' : ''} found
            </AlertDescription>
          </Alert>
        )}

        {parsedData.length > 0 && errors.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{parsedData.length} valid rows ready</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
