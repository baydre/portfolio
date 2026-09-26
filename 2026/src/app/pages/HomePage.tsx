import { ContactSection } from "../../components/contact/ContactSection";
import { Hero } from "../../components/home/Hero";
import { ServicesSection } from "../../components/home/ServicesSection";
import { WorkSection } from "../../components/home/WorkSection";

/**
 * Homepage.
 *
 * The full HomePage snippet is 7329px across six frames: nav+hero (1090), Work
 * (2562), Services (1962), Contact (921), footer (728) and a 66px copyright bar.
 * The footer and copyright bar are site-wide and render once, in `Layout`, so
 * they are not repeated here. What remains is the page's own content:
 *
 *   Hero             the 1090px frame
 *   WorkSection      #work
 *   ServicesSection  #services
 *   ContactSection   #contact
 *
 * The frame heights are NOT reproduced. Each of the design's frames is taller
 * than its content — the Work frame reserves several hundred pixels of empty
 * tail below its last card — so those are frame padding, not layout. Every
 * section here sizes to its content. See docs/FIGMA_IMPLEMENTATION.md §4.
 *
 * The design wraps the whole page in `absolute left-[201px] top-[161px]`
 * `min-w-screen min-h-screen`. That is the Figma canvas offset for the artboard
 * on the page, not a layout instruction: it is discarded here. The sections are
 * normal flow children of `<main>`.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <WorkSection />
      <ServicesSection />
      <ContactSection />
    </>
  );
}
