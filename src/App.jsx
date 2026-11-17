import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import { ArrowDownRight, ArrowUpRight, Menu } from 'lucide-react';

function Orb() {
  const mesh = useRef(null);
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.12;
      mesh.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.22} floatIntensity={0.45}>
      <mesh ref={mesh} scale={1.55}>
        <icosahedronGeometry args={[1, 5]} />
        <MeshDistortMaterial
          color="#b8a47a"
          roughness={0.22}
          metalness={0.78}
          distort={0.28}
          speed={1.5}
        />
      </mesh>
    </Float>
  );
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4.8], fov: 42 }} dpr={[1, 1.6]}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 4]} intensity={3} color="#fff1d6" />
      <pointLight position={[-3, -2, 2]} intensity={18} color="#7b6a49" />
      <Orb />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
    </Canvas>
  );
}

const projects = [
  { number: '01', type: 'BRAND IDENTITY', title: 'Restaurant & Food Branding', note: 'Identity systems, menus and visual direction' },
  { number: '02', type: 'DIGITAL DESIGN', title: 'Campaign & Social Visuals', note: 'Digital-first graphics built to stand out' },
  { number: '03', type: 'PRINT DESIGN', title: 'Posters, Flyers & Menus', note: 'Clear, memorable communication in print' },
];

export default function App() {
  return (
    <main>
      <nav className="nav">
        <a className="wordmark" href="#top" aria-label="Rakin Khan home">RK<span>.</span></a>
        <div className="nav-links">
          <a href="#work">Selected work</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <a className="nav-cta" href="#contact">Let’s talk <ArrowUpRight size={15} /></a>
        <button className="menu-button" aria-label="Open menu"><Menu size={21} /></button>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> INDEPENDENT GRAPHIC DESIGNER</p>
          <h1>RAKIN<br /><span>KHAN</span><i>.</i></h1>
          <div className="hero-bottom">
            <p className="hero-description">I create thoughtful visual identities and purposeful design that help brands make a lasting impression.</p>
            <a className="round-link" href="#work" aria-label="Explore selected work"><ArrowDownRight size={23} /></a>
          </div>
        </div>
        <div className="hero-art" aria-label="Animated 3D abstract sculpture">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="scene"><HeroScene /></div>
          <span className="art-index">3D / 001</span>
          <span className="art-caption">FORM STUDY — 2026</span>
        </div>
        <div className="hero-meta"><span>BASED IN BANGLADESH</span><span>AVAILABLE FOR SELECT PROJECTS</span><span>SCROLL TO EXPLORE ↓</span></div>
      </section>

      <section className="work section" id="work">
        <div className="section-heading">
          <p className="eyebrow">01 / SELECTED SERVICES</p>
          <h2>Design with<br /><span>purpose.</span></h2>
        </div>
        <div className="project-list">
          {projects.map((project) => (
            <a className="project-row" href="#contact" key={project.number}>
              <span className="project-number">{project.number}</span>
              <div className="project-info"><span>{project.type}</span><h3>{project.title}</h3><p>{project.note}</p></div>
              <ArrowUpRight className="project-arrow" size={22} />
            </a>
          ))}
        </div>
      </section>

      <section className="about section" id="about">
        <p className="eyebrow">02 / A LITTLE ABOUT ME</p>
        <div className="about-content">
          <h2>Good design<br />makes people <span>feel.</span></h2>
          <p>I’m Rakin Khan, an independent graphic designer focused on building clear, distinctive visual communication. From restaurant branding to digital campaigns, I bring ideas to life with thoughtful details and a strong visual point of view.</p>
        </div>
      </section>

      <section className="contact section" id="contact">
        <p className="eyebrow">03 / HAVE A PROJECT IN MIND?</p>
        <h2>Let’s make<br />something <span>matter.</span></h2>
        <a className="contact-link" href="mailto:rakinfiverr@gmail.com">rakinfiverr@gmail.com <ArrowUpRight size={20} /></a>
      </section>

      <footer><a className="wordmark" href="#top">RK<span>.</span></a><span>© 2026 RAKIN KHAN</span><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  );
}
