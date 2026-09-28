import { CinematicHero } from '../components/home/CinematicHero';
import { EverythingYouNeed } from '../components/home/EverythingYouNeed';
import { ProjectsLiquidSection } from '../components/home/ProjectsLiquidSection';
import { LiquidStorySection } from '../components/home/LiquidStorySection';

export default function HomePage() {
  return (
    <>
      <CinematicHero />
      <EverythingYouNeed />
      <ProjectsLiquidSection />
      <LiquidStorySection />
    </>
  );
}
