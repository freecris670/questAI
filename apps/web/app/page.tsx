import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Добро пожаловать в <span className="text-blue-600">QuestAI</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8">
          Создавайте и проходите уникальные квесты, генерируемые искусственным интеллектом
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          <Link 
            href="/quests"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Исследовать квесты
          </Link>
          <Link 
            href="/create"
            className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Создать свой квест
          </Link>
        </div>
      </div>
    </main>
  );
}
