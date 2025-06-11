import { QUEST_EXAMPLES } from "@/lib/constants";

export function QuestExamples() {
  return (
    <section className="pb-8 pt-8 md:pb-12 md:pt-12">
      <h2 className="text-2xl md:text-[24px] font-medium text-[#2553A1] text-center mb-8 md:mb-12">
        Примеры квестов
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {QUEST_EXAMPLES.map((item, index) => (
          <div key={index} className="bg-white border border-[#E3E6EA] rounded-md p-6 hover:shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-shadow duration-200 flex flex-col">
            <div className="w-10 h-10 bg-[#2553A1]/10 rounded-lg flex items-center justify-center mb-4">
              <item.icon className="w-6 h-6 text-[#2553A1]" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">{item.title}</h3>
            <p className="text-sm text-[#64748B] flex-grow">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
} 