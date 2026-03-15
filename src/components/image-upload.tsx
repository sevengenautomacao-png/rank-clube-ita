"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadImageToWebhook } from '@/lib/upload-image';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
  hint?: string;
  shape?: 'circle' | 'square';
}

export function ImageUpload({
  value,
  onChange,
  className,
  label = 'Foto',
  hint = 'Clique ou arraste uma imagem (JPG, PNG, WEBP)',
  shape = 'circle',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Arquivo inválido', description: 'Selecione uma imagem (JPG, PNG, WEBP).' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'A imagem deve ter no máximo 5 MB.' });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImageToWebhook(file);
      onChange(url);
      toast({ title: 'Imagem enviada!', description: 'A foto foi carregada com sucesso.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: (err as Error).message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isCircle = shape === 'circle';

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Preview / Drop Zone */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative cursor-pointer border-2 border-dashed transition-all duration-200 overflow-hidden flex items-center justify-center bg-muted/30 hover:bg-muted/50 group',
          isCircle ? 'w-24 h-24 rounded-full' : 'w-full h-40 rounded-xl',
          dragOver ? 'border-primary bg-primary/10 scale-105' : 'border-border',
          isUploading && 'pointer-events-none opacity-60',
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
              unoptimized
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </>
        ) : isUploading ? (
          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
        ) : (
          <div className="flex flex-col items-center gap-1 p-4 text-center">
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
            {!isCircle && (
              <p className="text-xs text-muted-foreground mt-1 leading-tight">{hint}</p>
            )}
          </div>
        )}
      </div>

      {/* File info + remove button */}
      <div className="flex items-center gap-2">
        {isUploading && (
          <p className="text-xs text-muted-foreground animate-pulse">Enviando imagem...</p>
        )}
        {value && !isUploading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
          >
            <X className="h-3 w-3" />
            Remover foto
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
