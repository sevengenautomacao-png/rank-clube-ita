"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Upload, 
  Filter,
  Users,
  Star,
  Info,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupabaseTable } from '@/hooks/use-supabase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { ClubEvent, Unit } from '@/lib/types';
import AddEventForm from '@/components/add-event-form';
import SpreadsheetUpload from '@/components/spreadsheet-upload';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: eventsCombined, loading: eventsLoading } = useSupabaseTable<ClubEvent>('events', {
      order: ['date', { ascending: true }]
  });

  const { data: units } = useSupabaseTable<Unit>('units');

  // Filter events by selected month
  const monthEvents = useMemo(() => {
    if (!eventsCombined) return [];
    return eventsCombined.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameMonth(eventDate, currentDate);
    });
  }, [eventsCombined, currentDate]);

  // Events for the selected day
  const selectedDayEvents = useMemo(() => {
    if (!eventsCombined) return [];
    return eventsCombined.filter(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, selectedDate);
    });
  }, [eventsCombined, selectedDate]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleAddEvent = async (eventData: Omit<ClubEvent, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase.from('events').insert(eventData);
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Evento adicionado com sucesso.",
      });
      setIsAddSheetOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar o evento.",
        variant: "destructive",
      });
    }
  };

  const handleBulkUpload = async (events: Omit<ClubEvent, 'id' | 'created_at'>[]) => {
    try {
      const { error } = await supabase.from('events').insert(events);
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: `${events.length} eventos importados com sucesso.`,
      });
      setIsAddSheetOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao importar eventos.",
        variant: "destructive",
      });
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'club': return <Badge variant="default" className="bg-blue-600">Clube</Badge>;
      case 'unit': return <Badge variant="secondary" className="bg-green-600">Unidade</Badge>;
      case 'extra': return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Extra</Badge>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:h-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" />
              Agenda de Eventos
            </h1>
          </div>

          {user && (
            <div className="w-full sm:w-auto flex justify-end">
              <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                  <SheetHeader>
                    <SheetTitle>Adicionar Eventos</SheetTitle>
                    <SheetDescription>
                      Crie eventos manualmente ou importe via planilha.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <Tabs defaultValue="manual" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="manual">Manual</TabsTrigger>
                      <TabsTrigger value="bulk">Planilha</TabsTrigger>
                    </TabsList>
                    <TabsContent value="manual">
                      <AddEventForm onEventAdd={handleAddEvent} units={units || []} />
                    </TabsContent>
                    <TabsContent value="bulk">
                      <SpreadsheetUpload onEventsUpload={handleBulkUpload} units={units || []} />
                    </TabsContent>
                  </Tabs>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-24 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-medium">
                  {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold mb-2 text-muted-foreground">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={`${day}-${i}`}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const hasEvents = eventsCombined?.some(e => isSameDay(parseISO(e.date), day));
                    const isSelected = isSameDay(day, selectedDate);
                    return (
                      <Button
                        key={i}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-10 w-full rounded-md p-0 font-normal relative",
                          isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          !isSelected && "hover:bg-accent"
                        )}
                        onClick={() => setSelectedDate(day)}
                      >
                        {format(day, 'd')}
                        {hasEvents && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="h-5 w-5" />
                  <CardTitle className="text-sm">Legenda</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>Evento do Clube</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                  <span>Evento de Unidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Evento Extra / Especial</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm">
              <h2 className="text-xl font-bold">
                {format(selectedDate, "dd/MM/yyyy")}
              </h2>
              <Badge variant="outline">{selectedDayEvents.length} Evento(s)</Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-250px)]">
              <div className="space-y-4 pr-4">
                {selectedDayEvents.length === 0 ? (
                  <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed flex flex-col items-center gap-4">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">Nenhum evento programado para este dia.</p>
                  </div>
                ) : (
                  selectedDayEvents.map((event) => {
                    const eventUnit = units?.find(u => u.id === event.unit_id);
                    return (
                      <Card key={event.id} className="relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1",
                          event.type === 'club' ? "bg-blue-600" : event.type === 'unit' ? "bg-green-600" : "bg-yellow-500"
                        )} />
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                {getTypeBadge(event.type)}
                                <CardTitle className="text-2xl mt-2">{event.title}</CardTitle>
                             </div>
                             {event.time && (
                                <Badge variant="secondary" className="text-lg">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {event.time}
                                </Badge>
                             )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {event.description && (
                            <p className="text-muted-foreground">{event.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-4 text-sm">
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.type === 'unit' && eventUnit && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>Unidade: {eventUnit.name}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </div>
  );
}
