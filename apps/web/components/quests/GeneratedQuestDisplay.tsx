import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Zap, Share2, Play, RefreshCw, Award, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

// Интерфейс для шага квеста
interface IQuestStep {
  title: string;
  description: string;
}

// Интерфейс для данных сгенерированного квеста
export interface IGeneratedQuestData {
  title: string;
  imageUrl?: string; // URL изображения для квеста (опционально)
  difficulty: 'Легкая' | 'Средняя' | 'Сложная' | 'Эксперт';
  estimatedTime: string; // Пример: "~45 минут"
  tags: string[];
  story: string;
  steps: IQuestStep[];
}

// Пропсы для компонента отображения сгенерированного квеста
interface GeneratedQuestDisplayProps {
  questData: IGeneratedQuestData;
  onStartQuest: () => void;
  onGenerateNew: () => void;
  onShare: () => void;
}

const GeneratedQuestDisplay: React.FC<GeneratedQuestDisplayProps> = ({
  questData,
  onStartQuest,
  onGenerateNew,
  onShare,
}) => {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка - основная информация */}
        <div className="lg:col-span-2">
          <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {questData.imageUrl && (
              <div className="relative w-full h-64 md:h-80 overflow-hidden">
                <Image 
                  src={questData.imageUrl} 
                  alt={`Изображение для квеста "${questData.title}"`} 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{questData.title}</h1>
                </div>
              </div>
            )}
            
            <CardContent className="p-6 space-y-6">
              {/* Метаданные */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Zap className="w-6 h-6 text-yellow-500 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Сложность</span>
                  <span className="font-medium">{questData.difficulty}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Время</span>
                  <span className="font-medium">{questData.estimatedTime}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Award className="w-6 h-6 text-purple-500 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Награда</span>
                  <span className="font-medium">150 XP</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-6 h-6 text-green-500 mb-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Прошли</span>
                  <span className="font-medium">24 человека</span>
                </div>
              </div>
              
              {/* Теги */}
              {questData.tags && questData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2">
                  {questData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <Separator className="my-4" />
              
              {/* История квеста */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">История квеста</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {questData.story}
                </p>
              </div>
              
              <Separator className="my-4" />
              
              {/* Шаги для выполнения */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Шаги для выполнения</h2>
                {questData.steps && questData.steps.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {questData.steps.map((step, index) => (
                      <AccordionItem value={`item-${index + 1}`} key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <AccordionTrigger className="text-lg font-medium px-4 py-3 hover:no-underline text-gray-800 dark:text-gray-200">
                          <div className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mr-3">
                              {index + 1}
                            </div>
                            {step.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 pt-1">
                          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line pl-11">
                            {step.description}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Шаги для этого квеста еще не определены.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Правая колонка - статус и действия */}
        <div className="lg:col-span-1">
          <Card className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden sticky top-4">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Статус квеста</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Прогресс</span>
                  <span className="font-medium">Не начат</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <Button size="lg" onClick={onStartQuest} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-6 rounded-md">
                  <Play className="mr-2 h-5 w-5" /> Начать квест
                </Button>
                
                <Button size="lg" variant="outline" onClick={onGenerateNew} className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 font-semibold py-3 rounded-md">
                  <RefreshCw className="mr-2 h-5 w-5" /> Сгенерировать новый
                </Button>
                
                <Button variant="ghost" onClick={onShare} className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-3">
                  <Share2 className="mr-2 h-5 w-5" /> Поделиться
                </Button>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h3 className="font-medium mb-2">Советы</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-5">
                  <li>Внимательно прочитайте все шаги перед началом</li>
                  <li>Вы можете делать заметки во время прохождения</li>
                  <li>Не торопитесь, наслаждайтесь процессом</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneratedQuestDisplay;
