import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Welcome to the Form Generator
        </h1>
        <Link href="/form">
          <div className="mt-2 text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:bg-gradient-to-l hover:from-blue-700 hover:to-blue-500 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 border border-blue-700 transition-all duration-300 ease-in-out cursor-pointer">
            Start
          </div>
        </Link>
      </div>
    </main>
  );
}
