import svgPaths from "./svg-2hhcgjcgeg";
import imgProfessionalStudioPortraitOfAnEducatorInWarmLighting from "figma:asset/e0c95dc2e661500cf05d6e89d1cbc725a2fda3fb.png";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Manrope:ExtraBold',sans-serif] font-extrabold justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[36px] tracking-[-0.9px] w-full">
        <p className="leading-[40px]">Share Your Journey</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[18px] w-full">
        <p className="leading-[29.25px]">Help others navigate their Korean learning path with an editorial perspective.</p>
      </div>
    </div>
  );
}

function EditorialHeader() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Editorial Header">
      <Heading />
      <Container />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#e0f2fe] content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#047abf] text-[14px] text-center w-[5.92px]">
        <p className="leading-[20px]">1</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[20px] tracking-[-0.5px] w-[182.23px]">
        <p className="leading-[28px]">Identity Verification</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Background />
      <Heading1 />
    </div>
  );
}

function ProfessionalStudioPortraitOfAnEducatorInWarmLighting() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px pointer-events-none relative rounded-[12px] w-full" data-name="Professional studio portrait of an educator in warm lighting">
      <div className="absolute inset-0 overflow-hidden rounded-[12px]">
        <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgProfessionalStudioPortraitOfAnEducatorInWarmLighting} />
      </div>
      <div aria-hidden="true" className="absolute border-4 border-solid border-white inset-0 rounded-[12px]" />
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute bottom-[-8px] h-[24.25px] right-[-8px] w-[24.833px]" data-name="Background">
      <div className="absolute inset-[-8.25%_-49.07%_-89.69%_-48.32%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 49.02 48">
          <g id="Background">
            <rect fill="var(--fill-0, #047ABF)" height="24.25" rx="12" width="24.8333" x="12" y="2" />
            <g filter="url(#filter0_dd_1_1042)" id="Overlay+Shadow">
              <rect fill="var(--fill-0, white)" fillOpacity="0.01" height="24" rx="12" shapeRendering="crispEdges" width="25.02" x="12" y="2" />
            </g>
            <path d={svgPaths.p36188980} fill="var(--fill-0, white)" id="Icon" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="48" id="filter0_dd_1_1042" width="49.02" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feMorphology in="SourceAlpha" operator="erode" radius="4" result="effect1_dropShadow_1_1042" />
              <feOffset dy="4" />
              <feGaussianBlur stdDeviation="3" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_1042" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feMorphology in="SourceAlpha" operator="erode" radius="3" result="effect2_dropShadow_1_1042" />
              <feOffset dy="10" />
              <feGaussianBlur stdDeviation="7.5" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="effect1_dropShadow_1_1042" mode="normal" result="effect2_dropShadow_1_1042" />
              <feBlend in="SourceGraphic" in2="effect2_dropShadow_1_1042" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0 size-[128px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center relative size-full">
        <ProfessionalStudioPortraitOfAnEducatorInWarmLighting />
        <div className="absolute bg-[rgba(4,122,191,0.1)] inset-0 rounded-[12px]" data-name="Overlay" />
        <Background1 />
      </div>
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(4,122,191,0.05)] content-stretch flex items-center left-0 px-[12px] py-[4px] rounded-[12px] top-0" data-name="Overlay">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#047abf] text-[12px] tracking-[1.2px] uppercase w-[181.52px]">
        <p className="leading-[16px]">Detected Learner Type</p>
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[36px]" data-name="Heading 3">
      <div className="flex flex-col font-['Manrope:ExtraBold',sans-serif] font-extrabold h-[32px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[24px] w-[399.39px]">
        <p className="leading-[32px]">Type A: Visual Exploratory Learner</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[0.625px] right-0 top-[74.88px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[46px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[14px] w-[470.42px]">
        <p className="leading-[22.75px] mb-0">Your learning patterns suggest a high affinity for cinematic content and</p>
        <p className="leading-[22.75px]">webtoon-based curriculum. This badge will appear next to your review.</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[121.5px] relative shrink-0 w-[494px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Overlay />
        <Heading2 />
        <Container4 />
      </div>
    </div>
  );
}

function BackgroundBorderShadow() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full" data-name="Background+Border+Shadow">
      <div aria-hidden="true" className="absolute border border-[rgba(203,213,225,0.1)] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_12px_32px_0px_rgba(4,122,191,0.05)]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[32px] items-center p-[33px] relative w-full">
          <Container2 />
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function SectionStep1LearnerIdentity() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Section - Step 1: Learner Identity">
      <Container1 />
      <BackgroundBorderShadow />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#e0f2fe] content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#047abf] text-[14px] text-center w-[8.73px]">
        <p className="leading-[20px]">2</p>
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[20px] tracking-[-0.5px] w-[160.09px]">
        <p className="leading-[28px]">Learning Context</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Background2 />
      <Heading3 />
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[340px]" data-name="Label">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-[98.98px]">
        <p className="leading-[20px]">Learning Level</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M7.2 9.6L12 14.4L16.8 9.6" id="Vector" stroke="var(--stroke-0, #6B7280)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}

function ImageFill() {
  return (
    <div className="absolute content-stretch flex flex-col h-[48px] items-start justify-center left-0 overflow-clip pl-[312px] pr-[8px] py-[12px] top-0 w-[344px]" data-name="image fill">
      <Svg />
    </div>
  );
}

function Container7() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-[16px] overflow-clip right-[16px] top-1/2" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[140.06px]">
        <p className="leading-[24px]">Beginner (TOPIK I)</p>
      </div>
    </div>
  );
}

function Options() {
  return (
    <div className="bg-[#f1f5f9] h-[48px] relative rounded-[2px] shrink-0 w-full" data-name="Options">
      <ImageFill />
      <Container7 />
    </div>
  );
}

function DropdownLearningLevel() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-end justify-self-stretch relative row-1 self-start shrink-0" data-name="Dropdown: Learning Level">
      <Label />
      <Options />
    </div>
  );
}

function Label1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[340px]" data-name="Label">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-[90.38px]">
        <p className="leading-[20px]">Usage Period</p>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="SVG">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="SVG">
          <path d="M7.2 9.6L12 14.4L16.8 9.6" id="Vector" stroke="var(--stroke-0, #6B7280)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </g>
      </svg>
    </div>
  );
}

function ImageFill1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[48px] items-start justify-center left-0 overflow-clip pl-[312px] pr-[8px] py-[12px] top-0 w-[344px]" data-name="image fill">
      <Svg1 />
    </div>
  );
}

function Container8() {
  return (
    <div className="-translate-y-1/2 absolute content-stretch flex flex-col items-start left-[16px] overflow-clip right-[16px] top-1/2" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[16px] w-[79.63px]">
        <p className="leading-[24px]">{`<1m (Trial)`}</p>
      </div>
    </div>
  );
}

function Options1() {
  return (
    <div className="bg-[#f1f5f9] h-[48px] relative rounded-[2px] shrink-0 w-full" data-name="Options">
      <ImageFill1 />
      <Container8 />
    </div>
  );
}

function DropdownUsagePeriod() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[8px] items-end justify-self-stretch relative row-1 self-start shrink-0" data-name="Dropdown: Usage Period">
      <Label1 />
      <Options1 />
    </div>
  );
}

function Label2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[716px]" data-name="Label">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] w-[119.69px]">
        <p className="leading-[20px]">Learning Purpose</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-0 px-[21px] py-[9px] rounded-[12px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[93.95px]">
        <p className="leading-[20px]">Entertainment</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#047abf] content-stretch flex flex-col items-center justify-center left-[143.95px] pb-[9.5px] pt-[8.5px] px-[20px] rounded-[12px] top-0" data-name="Button">
      <div className="absolute bg-[rgba(255,255,255,0)] inset-0 rounded-[12px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" data-name="Button:shadow" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[133.25px]">
        <p className="leading-[20px]">Academic Research</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[325.2px] px-[21px] py-[9px] rounded-[12px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[139.73px]">
        <p className="leading-[20px]">Business Proficiency</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[514.94px] px-[21px] py-[9px] rounded-[12px] top-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[43.98px]">
        <p className="leading-[20px]">Hobby</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-0 px-[21px] py-[9px] rounded-[12px] top-[46px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[123.17px]">
        <p className="leading-[20px]">TOPIK Preparation</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[84px] relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
    </div>
  );
}

function PurposeChips() {
  return (
    <div className="col-[1/span_2] content-stretch flex flex-col gap-[12px] items-end justify-self-stretch relative row-2 self-start shrink-0" data-name="Purpose Chips">
      <Label2 />
      <Container9 />
    </div>
  );
}

function Container6() {
  return (
    <div className="gap-x-[32px] gap-y-[32px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[__76px_116px] relative shrink-0 w-full" data-name="Container">
      <DropdownLearningLevel />
      <DropdownUsagePeriod />
      <PurposeChips />
    </div>
  );
}

function SectionStep2LogisticsContext() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Section - Step 2: Logistics & Context">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#e0f2fe] content-stretch flex items-center justify-center pb-[6.5px] pt-[5.5px] relative rounded-[12px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#047abf] text-[14px] text-center w-[8.92px]">
        <p className="leading-[20px]">3</p>
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Heading 2">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#0f172a] text-[20px] tracking-[-0.5px] w-[114.2px]">
        <p className="leading-[28px]">The Critique</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Background3 />
      <Heading4 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] tracking-[1.2px] uppercase w-[119.58px]">
        <p className="leading-[16px]">Overall Rating</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[28.5px] relative shrink-0 w-[30px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28.5">
          <path d={svgPaths.pbf6c896} fill="var(--fill-0, #047ABF)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[28.5px] relative shrink-0 w-[30px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28.5">
          <path d={svgPaths.pbf6c896} fill="var(--fill-0, #047ABF)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[28.5px] relative shrink-0 w-[30px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28.5">
          <path d={svgPaths.pbf6c896} fill="var(--fill-0, #047ABF)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[28.5px] relative shrink-0 w-[30px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28.5">
          <path d={svgPaths.pbf6c896} fill="var(--fill-0, #047ABF)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="h-[28.5px] relative shrink-0 w-[30px]" data-name="Icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 28.5">
          <path d={svgPaths.pfbd6f80} fill="var(--fill-0, #CBD5E1)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[8px] h-[28.5px] items-start relative shrink-0" data-name="Container">
      <Container13 />
      <Container14 />
      <Container15 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[8px] relative shrink-0" data-name="Margin">
      <Container12 />
    </div>
  );
}

function StarSelector() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center py-[16px] relative shrink-0 w-full" data-name="Star Selector">
      <Container11 />
      <Margin />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#a1a1aa] text-[16px] w-full whitespace-pre-wrap">
        <p className="leading-[24px] mb-0">{`Describe the curriculum's depth, cultural nuances, and pedagogical `}</p>
        <p className="leading-[24px]">effectiveness...</p>
      </div>
    </div>
  );
}

function TextAreaTextarea() {
  return (
    <div className="relative rounded-[4px] shrink-0 w-full" data-name="Text Area → Textarea">
      <div aria-hidden="true" className="absolute bg-white inset-0 pointer-events-none rounded-[4px]" />
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pb-[120px] pt-[24px] px-[24px] relative w-full">
          <Container18 />
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[30px] relative shrink-0 w-[33px]" data-name="Container">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 33 30">
        <g id="Container">
          <path d={svgPaths.p4a88c98} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[8px] relative">
        <Container19 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#0f172a] text-[14px] text-center w-[91.13px]">
          <p className="leading-[20px]">Upload Photo</p>
        </div>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] text-center w-[254.63px]">
        <p className="leading-[16px]">Showcase your progress or curriculum notes</p>
      </div>
    </div>
  );
}

function Margin2() {
  return (
    <div className="relative shrink-0" data-name="Margin">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pt-[4px] relative">
        <Container21 />
      </div>
    </div>
  );
}

function PhotoUploadButton() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center max-w-[384px] px-[2px] py-[42px] relative rounded-[8px] shrink-0 w-[384px]" data-name="Photo Upload → Button">
      <div aria-hidden="true" className="absolute border-2 border-[#cbd5e1] border-dashed inset-0 pointer-events-none rounded-[8px]" />
      <Margin1 />
      <Container20 />
      <Margin2 />
    </div>
  );
}

function Background4() {
  return (
    <div className="bg-[#f1f5f9] relative rounded-[8px] shrink-0 w-full" data-name="Background">
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[32px] items-center p-[32px] relative w-full">
          <StarSelector />
          <TextAreaTextarea />
          <PhotoUploadButton />
        </div>
      </div>
    </div>
  );
}

function SectionStep3ContentRating() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Section - Step 3: Content & Rating">
      <Container10 />
      <Background4 />
    </div>
  );
}

function Button5() {
  return (
    <div className="relative rounded-[6px] shadow-[0px_12px_32px_0px_rgba(4,122,191,0.05)] shrink-0 w-full" data-name="Button" style={{ backgroundImage: "linear-gradient(135deg, rgb(4, 122, 191) 0%, rgb(3, 105, 161) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center py-[20px] relative w-full">
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-center text-white tracking-[0.45px] w-[134.2px]">
          <p className="leading-[28px]">Submit Review</p>
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center px-[48px] relative w-full">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#475569] text-[12px] text-center w-[478.27px]">
            <p className="leading-[16px]">By submitting, you agree to our Editorial Guidelines and content moderation policies.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitAction() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start pt-[33px] relative shrink-0 w-full" data-name="Submit Action">
      <div aria-hidden="true" className="absolute border-[rgba(203,213,225,0.1)] border-solid border-t inset-0 pointer-events-none" />
      <Button5 />
      <Container22 />
    </div>
  );
}

function Form() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-start relative shrink-0 w-full" data-name="Form">
      <SectionStep1LearnerIdentity />
      <SectionStep2LogisticsContext />
      <SectionStep3ContentRating />
      <SubmitAction />
    </div>
  );
}

function Main() {
  return (
    <div className="max-w-[768px] relative shrink-0 w-full" data-name="Main">
      <div className="content-stretch flex flex-col gap-[48px] items-start max-w-[inherit] pb-[64px] pt-[48px] px-[24px] relative w-full">
        <EditorialHeader />
        <Form />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Manrope:Bold',sans-serif] font-bold h-[28px] justify-center leading-[0] relative shrink-0 text-[#075985] text-[20px] tracking-[-1px] w-[124.98px]">
        <p className="leading-[28px]">K-Learner Hub</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] tracking-[-0.35px] w-[65.8px]">
        <p className="leading-[20px]">Resources</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Manrope:Regular',sans-serif] font-normal h-[20px] justify-center leading-[0] relative shrink-0 text-[#475569] text-[14px] tracking-[-0.35px] w-[43.19px]">
        <p className="leading-[20px]">Guides</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Link">
      <div aria-hidden="true" className="absolute border-[#0369a1] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="flex flex-col font-['Manrope:SemiBold',sans-serif] font-semibold h-[20px] justify-center leading-[0] relative shrink-0 text-[#0369a1] text-[14px] tracking-[-0.35px] w-[76.14px]">
        <p className="leading-[20px]">Community</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[32px] items-center relative shrink-0" data-name="Container">
      <Link />
      <Link1 />
      <Link2 />
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[20px] relative shrink-0 w-[16px]" data-name="Button">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
        <g id="Button">
          <path d={svgPaths.p164b49c0} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Button">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Button">
          <path d={svgPaths.p3de21300} fill="var(--fill-0, #475569)" id="Icon" />
        </g>
      </svg>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button6 />
      <Button7 />
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[64px] max-w-[1280px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between max-w-[inherit] pl-[24px] pr-[24.02px] relative size-full">
          <Container24 />
          <Container25 />
          <Container26 />
        </div>
      </div>
    </div>
  );
}

function TopNavBarSharedComponent() {
  return (
    <div className="absolute backdrop-blur-[6px] bg-[rgba(255,255,255,0.8)] content-stretch flex flex-col items-start left-0 shadow-[0px_1px_2px_0px_rgba(12,74,110,0.05)] top-0 w-[1280px]" data-name="TopNavBar (Shared Component)">
      <Container23 />
    </div>
  );
}

export default function AFBlue() {
  return (
    <div className="bg-[#f8fafc] content-stretch flex flex-col items-start pt-[80px] px-[256px] relative size-full" data-name="후기 작성 - A~F 학습 유형 반영 (Blue)">
      <Main />
      <TopNavBarSharedComponent />
    </div>
  );
}