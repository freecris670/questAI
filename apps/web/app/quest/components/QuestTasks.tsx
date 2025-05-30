"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy as TrophyIcon } from 'lucide-react';
import { QuestTask } from '../types';
import { useUpdateTaskProgress } from '@/lib/hooks/useQuests';
import { useState } from 'react';

interface QuestTasksProps {
  tasks: QuestTask[];
  activeTaskId: string;
  questId: string;
}

export function QuestTasks({ tasks, activeTaskId, questId }: QuestTasksProps) {
  const [localTasks, setLocalTasks] = useState<QuestTask[]>(tasks);
  const updateTaskMutation = useUpdateTaskProgress(questId);
  
  // Функция для обработки изменения состояния чекбокса
  const handleCheckboxChange = async (taskId: string) => {
    try {
      // Найдем задачу в локальном состоянии
      const taskIndex = localTasks.findIndex(task => task.id === taskId);
      if (taskIndex === -1) return;
      
      const task = localTasks[taskIndex];
      const newCompletedStatus = !task.completed;
      
      // Обновляем в UI до получения ответа от сервера для лучшего UX
      const updatedTasks = [...localTasks];
      updatedTasks[taskIndex] = {
        ...task,
        completed: newCompletedStatus,
        progress: newCompletedStatus ? 100 : task.progress
      };
      setLocalTasks(updatedTasks);
      
      // Отправляем на сервер
      await updateTaskMutation.mutateAsync({
        taskId,
        completed: newCompletedStatus,
        progress: newCompletedStatus ? 100 : task.progress
      });
      
      // Показываем уведомление
      if (newCompletedStatus) {
        alert(`Задача выполнена! Вы получили ${task.xp} XP за выполнение задачи`);
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса задачи:', error);
      alert('Ошибка: Не удалось обновить статус задачи');
      
      // Возвращаем исходное состояние задачи в случае ошибки
      setLocalTasks([...tasks]);
    }
  };

  return (
    <Card className="mb-6 bg-gray-50 dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Задачи</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {localTasks.map((task) => {
            
            return (
              <div 
                key={task.id}
                className={`flex items-start p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${task.id === activeTaskId && !task.completed ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''}`}
              >
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleCheckboxChange(task.id)}
                    className="h-5 w-5 rounded-sm border-2 border-gray-300 dark:border-gray-600 
                      text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                  />
                </div>
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
