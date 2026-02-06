import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Download,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { AlertCircle } from 'lucide-react';

type ImportType = 'clients' | 'employees';

interface ParsedRow {
  [key: string]: any;
  _rowIndex?: number;
  _errors?: string[];
}

export function DataImport() {
  const { employee, loading: authLoading, user } = useAuth();
  const [importType, setImportType] = useState<ImportType>('clients');
  
  // Data Import is restricted to junaid@amzdudes.com only
  const userEmail = user?.email || employee?.email || '';
  const isAuthorizedCEO = employee?.role === 'CEO' && userEmail === 'junaid@amzdudes.com';
  
  if (!authLoading && !isAuthorizedCEO) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Access restricted. Only junaid@amzdudes.com can import data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPreviewData(validated.valid.slice(0, 10)); // Show first 10 rows for preview
      
      if (validated.errors.length > 0) {
        toast.warning(`Found ${validated.errors.length} validation errors. Please review before importing.`);
      } else {
        toast.success(`Successfully parsed ${validated.valid.length} rows`);
      }
    } catch (error) {
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setFile(null);
      setParsedData([]);
      setPreviewData([]);
    } finally {
      setIsProcessing(false);
    }
  };

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
            // Parse CSV
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
            // Parse Excel
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
        // Required fields for clients
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
            rowErrors.push(`Invalid client_type: ${clientType}. Must be brand_owner, wholesaler, or 3p_seller`);
          }
        }
      } else if (type === 'employees') {
        // Required fields for employees
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
        // Import clients
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

            // Check if client exists by email
            const { data: existing } = await supabase
              .from('clients')
              .select('id')
              .eq('email', clientData.email)
              .single();

            if (existing) {
              // Update existing
              const { error } = await supabase
                .from('clients')
                .update(clientData)
                .eq('id', existing.id);
              
              if (error) throw error;
            } else {
              // Insert new
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
        // Import employees
        for (const row of parsedData) {
          try {
            const employeeData: any = {
              name: row.name || '',
              email: row.email || '',
              role: row.role || 'employee',
            };

            // Check if employee exists by email
            const { data: existing } = await supabase
              .from('employees')
              .select('id')
              .eq('email', employeeData.email)
              .single();

            if (existing) {
              // Update existing
              const { error } = await supabase
                .from('employees')
                .update(employeeData)
                .eq('id', existing.id);
              
              if (error) throw error;
            } else {
              // Insert new
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
        toast.error(`Failed to import ${errors.length} rows. Check console for details.`);
        console.error('Import errors:', errors);
      }

      // Reset form
      setFile(null);
      setParsedData([]);
      setPreviewData([]);
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
      <CardHeader>
        <CardTitle>Data Import</CardTitle>
        <CardDescription>
          Upload CSV or Excel files to bulk import or update {importType} data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Import Type Selection */}
        <div className="space-y-2">
          <Label>Import Type</Label>
          <Select value={importType} onValueChange={(value) => {
            setImportType(value as ImportType);
            setFile(null);
            setParsedData([]);
            setPreviewData([]);
            setErrors([]);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clients">Clients</SelectItem>
              <SelectItem value="employees">Employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Select File</Label>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
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
                  {file.name}
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
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV (.csv), Excel (.xlsx, .xls)
          </p>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Processing file...</AlertDescription>
          </Alert>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-semibold">Validation Errors ({errors.length}):</p>
                <div className="max-h-40 overflow-y-auto text-xs">
                  {errors.slice(0, 10).map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                  {errors.length > 10 && <div>... and {errors.length - 10} more</div>}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Preview ({parsedData.length} rows ready to import)</Label>
              <Badge variant="secondary">{parsedData.length} valid rows</Badge>
            </div>
            <div className="border rounded-md max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewData[0] || {})
                      .filter(key => !key.startsWith('_'))
                      .map((key) => (
                        <TableHead key={key} className="capitalize">
                          {key.replace(/_/g, ' ')}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.keys(row)
                        .filter(key => !key.startsWith('_'))
                        .map((key) => (
                          <TableCell key={key}>{String(row[key] || '')}</TableCell>
                        ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {parsedData.length > 10 && (
              <p className="text-xs text-muted-foreground text-center">
                Showing first 10 rows of {parsedData.length} total rows
              </p>
            )}
          </div>
        )}

        {/* Import Button */}
        {parsedData.length > 0 && (
          <div className="flex items-center gap-4">
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
                  Import {parsedData.length} {importType}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setParsedData([]);
                setPreviewData([]);
                setErrors([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isImporting}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
