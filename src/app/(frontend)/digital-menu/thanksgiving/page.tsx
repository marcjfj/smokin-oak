import React from 'react'
import { goblinOne } from '@/lib/fonts'
import { Check, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import FallingLeaves from './FallingLeaves'

export default function ThanksgivingMenuPage() {
  return (
    <div className="min-h-screen md:h-screen overflow-x-hidden md:overflow-hidden bg-amber-100 text-stone-900 p-4 md:p-[2vh] flex flex-col relative">
      <FallingLeaves />
      {/* Header */}
      <header className="text-center mb-4 md:mb-[2vh] relative z-10">
        <h1
          className={`text-4xl md:text-[8vh] font-bold tracking-tight text-amber-900 leading-none ${goblinOne.className}`}
        >
          THANKSGIVING MENU
        </h1>
      </header>

      {/* Platters Include - Full Width */}
      <div className="bg-amber-900 rounded-lg p-4 md:p-[3vh] mb-4 md:mb-[2vh] text-amber-50 relative z-10">
        <h2
          className={`text-2xl md:text-[5vh] font-bold mb-4 md:mb-[2vh] text-center text-amber-100 ${goblinOne.className}`}
        >
          Platters Include
        </h2>
        <div className="flex flex-col md:flex-row justify-evenly items-start gap-3 md:gap-0 text-base md:text-[2.5vh] leading-tight">
          <div className="flex items-center gap-3">
            <Check className="text-amber-200 flex-shrink-0" size="1em" strokeWidth={3} />
            <p className="font-semibold">Your Choice of Protein</p>
          </div>
          <div className="flex items-center gap-3">
            <Check className="text-amber-200 flex-shrink-0" size="1em" strokeWidth={3} />
            <p className="font-semibold">2 Sides</p>
          </div>
          <div className="flex items-center gap-3">
            <Check className="text-amber-200 flex-shrink-0" size="1em" strokeWidth={3} />
            <p className="font-semibold">Fresh Jantz Bakery Roll</p>
          </div>
          <div className="flex items-center gap-3">
            <Check className="text-amber-200 flex-shrink-0" size="1em" strokeWidth={3} />
            <p className="font-semibold">Christi&apos;s Famous Cranberry Chutney</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[2vh] overflow-x-hidden md:overflow-hidden relative z-10">
        {/* Left Column */}
        <div className="flex flex-col gap-4 md:gap-[2vh]">
          {/* Proteins */}
          <div className="md:flex-1 p-3 md:p-[2vh]">
            <h3
              className={`text-2xl md:text-[3.8vh] font-bold mb-3 md:mb-[1.5vh] text-amber-900 ${goblinOne.className}`}
            >
              Protein Choices
            </h3>
            <ul className="space-y-2 md:space-y-[1vh] text-lg md:text-[2.8vh]">
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">Giant Smoked Turkey Leg</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">½ Pound of Sliced Smoked Turkey Breast</span>
              </li>
            </ul>
          </div>

          {/* Sides */}
          <div className="md:flex-1 p-3 md:p-[2vh]">
            <h3
              className={`text-2xl md:text-[3.8vh] font-bold mb-3 md:mb-[1.5vh] text-amber-900 ${goblinOne.className}`}
            >
              Side Choices
            </h3>
            <ul className="space-y-2 md:space-y-[1vh] text-lg md:text-[2.8vh]">
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">Garlic Mashed Potatoes with Smoked Turkey Gravy</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">Smoked Sourdough Stuffing</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">Southern Green Beans</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 md:gap-[2vh]">
          {/* Desserts */}
          <div className="md:flex-1 p-3 md:p-[2vh]">
            <h3
              className={`text-2xl md:text-[3.8vh] font-bold mb-3 md:mb-[1.5vh] text-amber-900 ${goblinOne.className}`}
            >
              Dessert Options
            </h3>
            <ul className="space-y-2 md:space-y-[1vh] text-lg md:text-[2.8vh]">
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">Pumpkin Cheesecake</span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">
                  Caramel Apple Spice Cake with Smoked Candied Pecans
                </span>
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="text-amber-700 flex-shrink-0" size="1em" strokeWidth={3} />
                <span className="font-bold">Cranberry Curd Almond Crust Tart</span>
              </li>
            </ul>
          </div>

          {/* Whole Turkey Option */}
          <div className="md:flex-1 p-3 md:p-[2vh] flex flex-col md:flex-row gap-3 md:gap-[2vh] items-center bg-yellow-200/50 border-2 border-amber-900 rounded-lg">
            <div className="flex-shrink-0 w-32 h-32 md:w-[20vh] md:h-[20vh] relative">
              <Image src="/turkey.png" alt="Whole Smoked Turkey" fill className="object-contain" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3
                className={`text-2xl md:text-[3.8vh] font-bold mb-2 md:mb-[1.5vh] text-amber-900 ${goblinOne.className}`}
              >
                Whole Smoked Turkey
              </h3>
              <p className="text-base md:text-[2.2vh] leading-relaxed font-bold">
                Limited amount of whole smoked spatchcocked turkeys available for pre-order. Fresh,
                all-natural Diestel Turkey from Sonora, weighing 10-12 lbs each.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Static page - can be cached
export const revalidate = 3600 // Revalidate every hour
