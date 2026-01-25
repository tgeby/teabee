const AppDisplay = () => {
    return (
        <section id="apps" className="w-full flex-1 pt-8 sm:pt-16 pb-32 items-center justify-start flex flex-col gap-2 text-3xl rounded-t-2xl">
            <h1 className="font-bold">My Apps</h1>
            <ul className="flex flex-col gap-8 mt-8">
            <li className="max-w-[500px] flex flex-col gap-8 items-center text-lg sm:text-xl text-center px-8">
                <a 
                href="https://timer.teabee.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-md transition-colors cursor-pointer p-2 w-fit items-center gap-2 bg-brand-primary text-text-bright btn-glow select-none text-center text-xl sm:text-4xl"
                >
                Interval Timer
                </a>
                <p>Create custom interval lists (like Pomodoro) that sync to your Google account.</p>
                <p className="italic">Note: Mobile apps are coming soon. The current web version requires your screen to stay active.</p>
            </li>
            </ul>
        </section>
    );
};

export default AppDisplay;