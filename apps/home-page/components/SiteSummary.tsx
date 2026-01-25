import Image from "next/image";

const SiteSummary = () => {
    return (
        <div id="about" className="w-full flex items-center justify-center px-4 sm:px-32 lg:px-64 py-8">
          <div className="relative size-32 sm:size-48 md-64 shrink-0">
            <Image src="/TeaBee.svg" alt="Bee Holding Mug of Tea" fill loading="eager" />
          </div>
          <div className="font-medium text-lg sm:text-xl lg:text-3xl flex flex-col text-center gap-8 max-w-[200px] sm:max-w-[300px] md:max-w-[500px]">
              <p className="leasding-relaxed font-bold">
                Life is busy. TeaBee is here to help you navigate it.
              </p>
          </div>
        </div>
    );
};

export default SiteSummary;