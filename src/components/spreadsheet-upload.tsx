"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { ClubEvent, Unit } from '@/lib/types';

type SpreadsheetUploadProps = {
  onEventsUpload: (events: Omit<ClubEvent, 'id' | 'created_at'>[]) => void;
  units: Unit[];
};

export default function SpreadsheetUpload({ onEventsUpload, units }: SpreadsheetUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (json.length === 0) {
          throw new Error('A planilha está vazia.');
        }

        const events: Omit<ClubEvent, 'id' | 'created_at'>[] = json.map((row, index) => {
          // Normalize column names (case-insensitive and common variants)
          const findValue = (keys: string[]) => {
            const foundKey = Object.keys(row).find(k => 
              keys.some(key => k.toLowerCase().includes(key.toLowerCase()))
            );
            return foundKey ? row[foundKey] : undefined;
          };

          const title = findValue(['título', 'titulo', 'nome', 'event', 'title']);
          const description = findValue(['descrição', 'descricao', 'detalhes', 'description']);
          const rawDate = findValue(['data', 'date', 'dia']);
          const time = findValue(['horário', 'horario', 'hora', 'time']);
          const location = findValue(['local', 'location', 'onde']);
          const typeStr = findValue(['tipo', 'type', 'categoria'])?.toString().toLowerCase();
          const unitName = findValue(['unidade', 'unit', 'clube']);

          if (!title || !rawDate) {
            throw new Error(`Linha ${index + 2}: Título e Data são obrigatórios.`);
          }

          // Parse date
          let dateStr = '';
          if (typeof rawDate === 'number') {
            // Excel serial date
            const date = XLSX.SSF.parse_date_code(rawDate);
            dateStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
          } else {
            dateStr = rawDate.toString();
          }

          // Normalize type
          let type: 'club' | 'unit' | 'extra' = 'club';
          if (typeStr?.includes('unidade')) type = 'unit';
          else if (typeStr?.includes('extra') || typeStr?.includes('especial')) type = 'extra';

          // Find unit ID
          let unitId = undefined;
          if (type === 'unit' && unitName) {
            const unit = units.find(u => 
              u.name.toLowerCase().includes(unitName.toString().toLowerCase()) ||
              unitName.toString().toLowerCase().includes(u.name.toLowerCase())
            );
            unitId = unit?.id;
          }

          return {
            title: title.toString(),
            description: description?.toString(),
            date: dateStr,
            time: time?.toString(),
            location: location?.toString(),
            type,
            unit_id: unitId,
          };
        });

        onEventsUpload(events);
        setSuccess(`${events.length} eventos processados com sucesso!`);
      } catch (err: any) {
        setError(err.message || 'Erro ao processar a planilha. Verifique o formato.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Erro ao ler o arquivo.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(file);
  }, [onEventsUpload, units]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4 py-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {isProcessing ? (
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="space-y-1">
            <p className="font-medium">
              {isDragActive ? "Solte o arquivo aqui" : "Arraste uma planilha ou clique para selecionar"}
            </p>
            <p className="text-sm text-muted-foreground">
              Suporta .xlsx e .csv
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500 bg-green-500/10 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg flex gap-2 items-start">
        <FileSpreadsheet className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">Dica de Formato:</p>
          <p>A planilha deve conter colunas chamadas: <strong>Título</strong>, <strong>Data</strong> (YYYY-MM-DD), <strong>Horário</strong>, <strong>Local</strong>, <strong>Tipo</strong>, e <strong>Unidade</strong>.</p>
        </div>
      </div>
    </div>
  );
}
