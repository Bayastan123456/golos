export type Difficulty = "easy" | "medium" | "hard";

export interface TongueTwister {
    id: string;
    title: string;
    text: string;
    difficulty: Difficulty;
    tip: string;
}

export const tongueTwisters: TongueTwister[] = [
    {
        id: "easy-1",
        title: "Шла Саша",
        text: "Шла Саша по шоссе и сосала сушку.",
        difficulty: "easy",
        tip: "Обращай внимание на звуки Ш и С.",
    },
    {
        id: "easy-2",
        title: "Ежата",
        text: "У ежа ежата, у ужа ужата.",
        difficulty: "easy",
        tip: "Произноси слова медленно и отчётливо.",
    },
    {
        id: "easy-3",
        title: "Черепашки",
        text: "У четырёх черепашек четыре черепашонка.",
        difficulty: "easy",
        tip: "Следи за произношением звуков Ч и Р.",
    },
    {
        id: "medium-1",
        title: "Топот копыт",
        text: "От топота копыт пыль по полю летит.",
        difficulty: "medium",
        tip: "Тренируй звуки Т, П и К.",
    },
    {
        id: "medium-2",
        title: "Карл и Клара",
        text: "Карл у Клары украл кораллы, а Клара у Карла украла кларнет.",
        difficulty: "medium",
        tip: "Старайся не пропускать звук Р.",
    },
    {
        id: "medium-3",
        title: "Кукушка",
        text: "Кукушка кукушонку купила капюшон.",
        difficulty: "medium",
        tip: "Сохраняй чёткость звука К.",
    },
    {
        id: "hard-1",
        title: "На дворе трава",
        text: "На дворе трава, на траве дрова, не руби дрова на траве двора.",
        difficulty: "hard",
        tip: "Следи за сочетаниями ТР и ДР.",
    },
    {
        id: "hard-2",
        title: "Тридцать три корабля",
        text: "Тридцать три корабля лавировали, лавировали, да не вылавировали.",
        difficulty: "hard",
        tip: "Начинай медленно, постепенно увеличивая темп.",
    },
    {
        id: "hard-3",
        title: "Колпак",
        text: "Сшит колпак не по-колпаковски, вылит колокол не по-колоколовски.",
        difficulty: "hard",
        tip: "Разделяй длинные слова на слоги.",
    },
];
