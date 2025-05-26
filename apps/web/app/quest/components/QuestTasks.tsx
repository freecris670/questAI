"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check as CheckIcon, Trophy as TrophyIcon } from 'lucide-react';
import { QuestTask } from '../types';

interface QuestTasksProps {
  tasks: QuestTask[];
  activeTaskId: string;
}

export function QuestTasks({ tasks, activeTaskId }: QuestTasksProps) {
  // Функция для обработки изменения состояния чекбокса
  const handleCheckboxChange = (taskId: string) => {
    // Здесь будет логика изменения состояния задачи
    console.log(`Изменено состояние задачи ${taskId}`);
  };

  // Проверка наличия подзадач (в данной моковой версии считаем, что подзадач нет)
  const hasSubtasks = (taskId: string) => {
    // В будущем здесь будет реальная проверка подзадач
    return false;
  };
  
  return (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Задачи</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const hasTaskSubtasks = hasSubtasks(task.id);
            const fillProgress = !task.completed && task.progress > 0;
            
            return (
              <div 
                key={task.id}
                className={`flex items-start p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${task.id === activeTaskId && !task.completed ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''}`}
              >
                {hasTaskSubtasks ? (
                  // Круглый индикатор для задач с подзадачами
                  <div 
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5
                      ${task.completed ? 'bg-green-100 dark:bg-green-900/70' : 
                        fillProgress ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    {task.completed ? (
                      <CheckIcon size={14} className="text-green-600 dark:text-green-400" />
                    ) : (
                      <span className="text-xs text-white dark:text-white">{index + 1}</span>
                    )}
                  </div>
                ) : (
                  // Чекбокс для задач без подзадач
                  <div className="flex-shrink-0 mr-3 mt-0.5">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleCheckboxChange(task.id)}
                      className="h-5 w-5 rounded-sm border-2 border-gray-300 dark:border-gray-600 
                        text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                    />
                  </div>
                )}
                <div>
                  <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.description}</p>
                  {task.reward && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center">
                      <TrophyIcon size={12} className="mr-1" /> Награда: {task.reward}
                    </div>
                  )}
                  {task.id === activeTaskId && !task.completed && task.progress > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Прогресс</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
