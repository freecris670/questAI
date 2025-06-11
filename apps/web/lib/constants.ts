import { PlaceholderIcon } from "@/components/icons/PlaceholderIcon";

// Временная иконка-заглушка. В идеале использовать библиотеку иконок, например lucide-react.
const PlaceholderIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.75 6.375C12.75 5.82292 12.5208 5.375 12 5.375C11.4792 5.375 11.25 5.82292 11.25 6.375V11.25H6.375C5.82292 11.25 5.375 11.4792 5.375 12C5.375 12.5208 5.82292 12.75 6.375 12.75H11.25V17.625C11.25 18.1771 11.4792 18.625 12 18.625C12.5208 18.625 12.75 18.1771 12.75 17.625V12.75H17.625C18.1771 12.75 18.625 12.5208 18.625 12C18.625 11.4792 18.1771 11.25 17.625 11.25H12.75V6.375Z" />
  </svg>
);

export const QUEST_EXAMPLES = [
  { 
    title: "Квест по истории Древнего Рима", 
    description: "Узнайте о гладиаторах, императорах и великих битвах.",
    icon: PlaceholderIcon,
  },
  { 
    title: "Кулинарный квест: Итальянская кухня", 
    description: "Научитесь готовить пасту и пиццу как настоящий шеф-повар.",
    icon: PlaceholderIcon,
  },
  { 
    title: "Фитнес-вызов на 30 дней", 
    description: "Приведите себя в форму с ежедневными заданиями и советами.",
    icon: PlaceholderIcon,
  },
]; 