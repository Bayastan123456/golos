import { Link } from "react-router";
import { ArrowLeft, Construction } from "lucide-react";

type SectionPageProps = {
    title: string;
};

export default function SectionPage({
                                        title,
                                    }: SectionPageProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                <Construction size={30} />
            </div>

            <h1 className="text-3xl font-bold">{title}</h1>

            <p className="mt-3 max-w-md text-sm leading-7 text-gray-500 dark:text-gray-400">
                Этот раздел находится в разработке.
                Скоро здесь появятся интерактивные упражнения.
            </p>

            <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-700"
            >
                <ArrowLeft size={17} />
                На главную
            </Link>
        </div>
    );
}
