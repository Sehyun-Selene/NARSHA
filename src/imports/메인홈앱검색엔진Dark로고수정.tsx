import svgPaths from "./svg-a26n3s1hok";
import imgDuolingo from "figma:asset/8ed1b2b30b72e2da116be745151d3aaa6c487b40.png";
import imgTtmik from "figma:asset/63503fcb90bfc4bfc7bbd3c9760f3f1ff9e0c278.png";
import imgAnki from "figma:asset/cecfc5a8362d2520b5d8db54d485e5dee0d1d92d.png";
import imgLingoDeer from "figma:asset/63ff2dab9e712814fb813d14e8b5c1a0382a4175.png";
import imgTeuida from "figma:asset/ad5bdc3a777418be2d0b8b4a1ce4c3ccf5ed3da7.png";
import imgKingSejong from "figma:asset/190a7b786189bfc0be7e9b8e11f5de00c55f8bc5.png";
import imgMemrise from "figma:asset/6cc867a6c541cf33199cd64ed39c98bd246e03aa.png";
import imgDrops from "figma:asset/35e508132dcd8901f597aa54dccacd152e2d1808.png";
import imgNarshaLogo from "figma:asset/baacbacddc1159da6b8db077db32eef8653ca9f3.png";
import imgUserAvatar from "figma:asset/5268ce239f7e768af0faef970d6bcd246ff00122.png";
import imgHorizontalDivider from "figma:asset/145699dc713ad92eb9e8590cfd41977c4af7e8ff.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="bg-clip-text flex flex-col font-['Manrope:ExtraBold',sans-serif] font-extrabold h-[72px] justify-center leading-[0] relative shrink-0 text-[72px] text-[transparent] text-center tracking-[-3.6px] w-[795.97px]" style={{ backgroundImage: "linear-gradient(174.831deg, rgb(142, 205, 255) 0%, rgb(27, 153, 220) 100%)" }}>
        <p className="leading-[72px]">Find your path to fluency.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[56px] justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[18px] text-center w-[599.25px]">
        <p className="leading-[28px] mb-0">Discover, compare, and master Korean with our architecturally curated</p>
        <p className="leading-[28px]">{`database of the world's best language resources.`}</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px overflow-clip relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#3f4850] text-[16px] w-full">
        <p className="leading-[normal]">{`Search resources (e.g., 'Grammar', 'TOPIK', 'Apps')`}</p>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-[#070e19] relative rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pl-[64px] pr-[24px] py-[22px] relative w-full">
          <Container1 />
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, #8ECDFF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bottom-0 content-stretch flex items-center left-[24px] top-[24px]" data-name="Container">
      <Container3 />
    </div>
  );
}

function SearchBar() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[768px] pt-[24px] relative shrink-0 w-[768px]" data-name="Search Bar">
      <Input />
      <Container2 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p33e770c0} fill="var(--fill-0, #DCE3F3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#232a36] content-stretch flex gap-[7.99px] items-center px-[25px] py-[11px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container4 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#dce3f3] text-[14px] text-center w-[34.95px]">
        <p className="leading-[20px]">Level</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0 size-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.6667">
        <g id="Container">
          <path d={svgPaths.p2afdb540} fill="var(--fill-0, #DCE3F3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#232a36] content-stretch flex gap-[8px] items-center px-[25px] py-[11px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container5 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#dce3f3] text-[14px] text-center w-[55.23px]">
        <p className="leading-[20px]">Purpose</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[11.667px] relative shrink-0 w-[11.083px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.0833 11.6667">
        <g id="Container">
          <path d={svgPaths.pd995200} fill="var(--fill-0, #DCE3F3)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#232a36] content-stretch flex gap-[8px] items-center px-[25px] py-[11px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container6 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#dce3f3] text-[14px] text-center w-[94.8px]">
        <p className="leading-[20px]">Learning Type</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[10.5px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
        <g id="Container">
          <path d={svgPaths.p58a2200} fill="var(--fill-0, #8ECDFF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-[rgba(142,205,255,0.1)] content-stretch flex gap-[7.99px] items-center px-[25px] py-[11px] relative rounded-[9999px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[rgba(142,205,255,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <Container7 />
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#8ecdff] text-[14px] text-center w-[78.7px]">
        <p className="leading-[20px]">More Filters</p>
      </div>
    </div>
  );
}

function Filters() {
  return (
    <div className="content-stretch flex gap-[12px] items-start justify-center pt-[16px] relative shrink-0 w-full" data-name="Filters">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function HeroSection() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-full" data-name="Hero Section">
      <Heading />
      <Container />
      <SearchBar />
      <Filters />
    </div>
  );
}

function Duolingo() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Duolingo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgDuolingo} />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Duolingo />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[22.05px]">
        <p className="leading-[20px]">4.2</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[87.3px]">
        <p className="leading-[28px]">Duolingo</p>
      </div>
      <Container11 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Gamified learning paths focusing on</p>
        <p className="leading-[20px]">vocabulary and basic sentence…</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[57.86px]">
          <p className="leading-[15px]">Vocab: 4/5</p>
        </div>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[75.39px]">
          <p className="leading-[15px]">Grammar: 2/5</p>
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background />
      <Background1 />
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container10 />
        <Container14 />
        <Container15 />
      </div>
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[58.67px]">
        <p className="leading-[15px]">Beginner</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background2 />
    </div>
  );
}

function Card1Duolingo() {
  return (
    <div className="bg-[#151c27] col-1 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-1 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 1: Duolingo">
      <Container8 />
      <Container9 />
      <Container16 />
    </div>
  );
}

function Ttmik() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="TTMIK">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgTtmik} />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Ttmik />
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[22.13px]">
        <p className="leading-[20px]">4.9</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container21 />
      <Container22 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[61.13px]">
        <p className="leading-[28px]">TTMIK</p>
      </div>
      <Container20 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">The gold standard for natural</p>
        <p className="leading-[20px]">conversational Korean with…</p>
      </div>
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[72.92px]">
          <p className="leading-[15px]">Speaking: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[67.75px]">
          <p className="leading-[15px]">Culture: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background3 />
      <Background4 />
    </div>
  );
}

function Container18() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container19 />
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function Background5() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[68.31px]">
        <p className="leading-[15px]">All Levels</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background5 />
    </div>
  );
}

function Card2Ttmik() {
  return (
    <div className="bg-[#151c27] col-2 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-1 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 2: TTMIK">
      <Container17 />
      <Container18 />
      <Container25 />
    </div>
  );
}

function Anki() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Anki">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgAnki} />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Anki />
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[21.09px]">
        <p className="leading-[20px]">4.7</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container30 />
      <Container31 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[42.3px]">
        <p className="leading-[28px]">Anki</p>
      </div>
      <Container29 />
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Spaced repetition system for high-</p>
        <p className="leading-[20px]">efficiency vocabulary memorization.</p>
      </div>
    </div>
  );
}

function Background6() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[41.28px]">
          <p className="leading-[15px]">SRS: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background7() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[66.11px]">
          <p className="leading-[15px]">Custom: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background6 />
      <Background7 />
    </div>
  );
}

function Container27() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container28 />
        <Container32 />
        <Container33 />
      </div>
    </div>
  );
}

function Background8() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[64.16px]">
        <p className="leading-[15px]">Advanced</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background8 />
    </div>
  );
}

function Card3Anki() {
  return (
    <div className="bg-[#151c27] col-3 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-1 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 3: Anki">
      <Container26 />
      <Container27 />
      <Container34 />
    </div>
  );
}

function LingoDeer() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="LingoDeer">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgLingoDeer} />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <LingoDeer />
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[21.92px]">
        <p className="leading-[20px]">4.8</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container37() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative w-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[99.55px]">
          <p className="leading-[28px]">LingoDeer</p>
        </div>
        <Container38 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Specifically designed for Asian</p>
        <p className="leading-[20px]">languages with superior grammar…</p>
      </div>
    </div>
  );
}

function Background9() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[75.28px]">
          <p className="leading-[15px]">Grammar: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background10() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[54.41px]">
          <p className="leading-[15px]">Audio: 4/5</p>
        </div>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background9 />
      <Background10 />
    </div>
  );
}

function Container36() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container37 />
        <Container41 />
        <Container42 />
      </div>
    </div>
  );
}

function Background11() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[66.41px]">
        <p className="leading-[15px]">Beginner+</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background11 />
    </div>
  );
}

function Card4LingoDeer() {
  return (
    <div className="bg-[#151c27] col-4 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-1 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 4: LingoDeer">
      <Container35 />
      <Container36 />
      <Container43 />
    </div>
  );
}

function Teuida() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Teuida">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgTeuida} />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Teuida />
    </div>
  );
}

function Container48() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[21.77px]">
        <p className="leading-[20px]">4.5</p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex gap-[3.99px] items-center relative shrink-0" data-name="Container">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[64.56px]">
        <p className="leading-[28px]">Teuida</p>
      </div>
      <Container47 />
    </div>
  );
}

function Container50() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Unique first-person perspective</p>
        <p className="leading-[20px]">interactive speaking practice with…</p>
      </div>
    </div>
  );
}

function Background12() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[68.17px]">
          <p className="leading-[15px]">Fluency: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background13() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[43.13px]">
          <p className="leading-[15px]">Fun: 4/5</p>
        </div>
      </div>
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background12 />
      <Background13 />
    </div>
  );
}

function Container45() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container46 />
        <Container50 />
        <Container51 />
      </div>
    </div>
  );
}

function Background14() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[59.17px]">
        <p className="leading-[15px]">Speaking</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background14 />
    </div>
  );
}

function Card5Teuida() {
  return (
    <div className="bg-[#151c27] col-1 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-2 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 5: Teuida">
      <Container44 />
      <Container45 />
      <Container52 />
    </div>
  );
}

function KingSejong() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="King Sejong">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgKingSejong} />
      </div>
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <KingSejong />
    </div>
  );
}

function Container57() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container58() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[21.89px]">
        <p className="leading-[20px]">4.6</p>
      </div>
    </div>
  );
}

function Container56() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container57 />
      <Container58 />
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[115.53px]">
        <p className="leading-[28px]">King Sejong</p>
      </div>
      <Container56 />
    </div>
  );
}

function Container59() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Official learning materials provided</p>
        <p className="leading-[20px]">by the Korean government institute.</p>
      </div>
    </div>
  );
}

function Background15() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[63.98px]">
          <p className="leading-[15px]">Formal: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background16() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[51.97px]">
          <p className="leading-[15px]">TOPIK: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background15 />
      <Background16 />
    </div>
  );
}

function Container54() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container55 />
        <Container59 />
        <Container60 />
      </div>
    </div>
  );
}

function Background17() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[61.92px]">
        <p className="leading-[15px]">Academic</p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background17 />
    </div>
  );
}

function Card6KingSejong() {
  return (
    <div className="bg-[#151c27] col-2 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-2 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 6: King Sejong">
      <Container53 />
      <Container54 />
      <Container61 />
    </div>
  );
}

function Memrise() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Memrise">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgMemrise} />
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Memrise />
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[21.89px]">
        <p className="leading-[20px]">4.3</p>
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container66 />
      <Container67 />
    </div>
  );
}

function Container64() {
  return (
    <div className="content-stretch flex items-start justify-between relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[83.28px]">
        <p className="leading-[28px]">Memrise</p>
      </div>
      <Container65 />
    </div>
  );
}

function Container68() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Learn with natives using real-world</p>
        <p className="leading-[20px]">video clips and mnemonic…</p>
      </div>
    </div>
  );
}

function Background18() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[58.44px]">
          <p className="leading-[15px]">Native: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background19() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[60.56px]">
          <p className="leading-[15px]">Recall: 4/5</p>
        </div>
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background18 />
      <Background19 />
    </div>
  );
}

function Container63() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container64 />
        <Container68 />
        <Container69 />
      </div>
    </div>
  );
}

function Background20() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[54.41px]">
        <p className="leading-[15px]">Natural</p>
      </div>
    </div>
  );
}

function Container70() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background20 />
    </div>
  );
}

function Card7Memrise() {
  return (
    <div className="bg-[#151c27] col-3 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-2 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 7: Memrise">
      <Container62 />
      <Container63 />
      <Container70 />
    </div>
  );
}

function Drops() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="Drops">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[151.04%] left-0 max-w-none top-[-25.52%] w-full" src={imgDrops} />
      </div>
    </div>
  );
}

function Container71() {
  return (
    <div className="content-stretch flex flex-col h-[192px] items-start justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Drops />
    </div>
  );
}

function Container75() {
  return (
    <div className="h-[11.083px] relative shrink-0 w-[11.667px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 11.0833">
        <g id="Container">
          <path d={svgPaths.p21398000} fill="var(--fill-0, #FFB867)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container76() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#ffb867] text-[14px] w-[22.64px]">
        <p className="leading-[20px]">4.4</p>
      </div>
    </div>
  );
}

function Container74() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container75 />
      <Container76 />
    </div>
  );
}

function Container73() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative w-full">
        <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#dce3f3] text-[20px] w-[57.06px]">
          <p className="leading-[28px]">Drops</p>
        </div>
        <Container74 />
      </div>
    </div>
  );
}

function Container77() {
  return (
    <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#bec7d2] text-[14px] w-full">
        <p className="leading-[20px] mb-0">Highly visual and fast-paced</p>
        <p className="leading-[20px]">vocabulary builder for short daily…</p>
      </div>
    </div>
  );
}

function Background21() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[58.39px]">
          <p className="leading-[15px]">Visual: 5/5</p>
        </div>
      </div>
    </div>
  );
}

function Background22() {
  return (
    <div className="bg-[#2e3541] relative rounded-[4px] self-stretch shrink-0" data-name="Background">
      <div className="content-stretch flex flex-col h-full items-start px-[8px] py-[4px] relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#89929b] text-[10px] uppercase w-[54.58px]">
          <p className="leading-[15px]">Speed: 4/5</p>
        </div>
      </div>
    </div>
  );
}

function Container78() {
  return (
    <div className="content-stretch flex gap-[8px] h-[39px] items-start pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Background21 />
      <Background22 />
    </div>
  );
}

function Container72() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[8px] items-start p-[24px] relative w-full">
        <Container73 />
        <Container77 />
        <Container78 />
      </div>
    </div>
  );
}

function Background23() {
  return (
    <div className="bg-[#2a4c66] content-stretch flex items-start px-[12px] py-[2.5px] relative rounded-[9999px] shrink-0" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#9abcda] text-[10px] tracking-[1px] uppercase w-[42.64px]">
        <p className="leading-[15px]">Visual</p>
      </div>
    </div>
  );
}

function Container79() {
  return (
    <div className="absolute content-stretch flex flex-col items-start right-[16px] top-[13px]" data-name="Container">
      <Background23 />
    </div>
  );
}

function Card8Drops() {
  return (
    <div className="bg-[#151c27] col-4 content-stretch flex flex-col items-start justify-self-stretch overflow-clip relative rounded-[12px] row-2 self-start shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] shrink-0" data-name="Card 8: Drops">
      <Container71 />
      <Container72 />
      <Container79 />
    </div>
  );
}

function ContentGridAppCards() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[repeat(4,minmax(0,1fr))] grid-rows-[__363px_363px] relative shrink-0 w-full" data-name="Content Grid (App Cards)">
      <Card1Duolingo />
      <Card2Ttmik />
      <Card3Anki />
      <Card4LingoDeer />
      <Card5Teuida />
      <Card6KingSejong />
      <Card7Memrise />
      <Card8Drops />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[64px] items-start max-w-[inherit] pb-[96px] pt-[128px] px-[24px] relative w-full">
        <HeroSection />
        <ContentGridAppCards />
      </div>
    </div>
  );
}

function NarshaLogo() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="NARSHA Logo">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[96%] left-0 max-w-none top-[2%] w-full" src={imgNarshaLogo} />
      </div>
    </div>
  );
}

function Container82() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#8ecdff] text-[20px] tracking-[-1px] w-[75.97px]">
        <p className="leading-[28px]">NARSHA</p>
      </div>
    </div>
  );
}

function Container81() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <NarshaLogo />
      <Container82 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden="true" className="absolute border-[#8ecdff] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] relative shrink-0 text-[#8ecdff] text-[16px] tracking-[-0.4px] w-[60.38px]">
        <p className="leading-[24px]">Discover</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] tracking-[-0.4px] w-[44.98px]">
        <p className="leading-[24px]">Levels</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] tracking-[-0.4px] w-[58.69px]">
        <p className="leading-[24px]">Reviews</p>
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Manrope:Medium',sans-serif] font-medium h-[24px] justify-center leading-[0] relative shrink-0 text-[#94a3b8] text-[16px] tracking-[-0.4px] w-[70.67px]">
        <p className="leading-[24px]">Curations</p>
      </div>
    </div>
  );
}

function Container83() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Container">
      <Link />
      <Link1 />
      <Link2 />
      <Link3 />
    </div>
  );
}

function Container85() {
  return (
    <div className="relative shrink-0 size-[18px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Container">
          <path d={svgPaths.p8a35e00} fill="var(--fill-0, #8ECDFF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container85 />
    </div>
  );
}

function Container86() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Container">
          <path d={svgPaths.p164b49c0} fill="var(--fill-0, #8ECDFF)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Button">
      <Container86 />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="max-w-[40px] relative shrink-0 size-[38px]" data-name="User avatar">
      <div className="absolute bg-clip-padding border-0 border-[transparent] border-solid inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute left-[-2.63%] max-w-none size-[105.26%] top-[-2.63%]" src={imgUserAvatar} />
      </div>
    </div>
  );
}

function Border() {
  return (
    <div className="relative rounded-[9999px] shrink-0 size-[40px]" data-name="Border">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <UserAvatar />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container84() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Container">
      <Button4 />
      <Button5 />
      <Border />
    </div>
  );
}

function Container80() {
  return (
    <div className="h-[80px] max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] px-[32px] relative size-full">
          <Container81 />
          <Container83 />
          <Container84 />
        </div>
      </div>
    </div>
  );
}

function TopNavBar() {
  return (
    <div className="absolute backdrop-blur-[32px] bg-[rgba(12,20,31,0.8)] content-stretch flex flex-col items-start left-0 top-0 w-[1280px]" data-name="TopNavBar">
      <Container80 />
      <div className="h-px relative shrink-0 w-full" data-name="Horizontal Divider">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHorizontalDivider} />
      </div>
    </div>
  );
}

export default function Dark() {
  return (
    <div className="bg-[#0c141f] content-stretch flex flex-col items-start relative size-full" data-name="메인 홈 - 앱 검색 엔진 (Dark) - 로고 수정">
      <Main />
      <TopNavBar />
    </div>
  );
}