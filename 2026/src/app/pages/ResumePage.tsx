export function ResumePage() {
  const experiences = [
    {
      company: "Front-end Developer - Simply",
      location: "New Tashkent, Tashkent",
      period: "March - present",
      responsibilities: [
        "Implemented a component-driven UI with 45 reusable atomic clients.",
        "Led design and development of an internal application and three efficiency By 32%.",
      ],
    },
    {
      company: "PENT DEVELOPER - Simply",
      location: "New Tashkent, Tashkent",
      period: "March - present",
      responsibilities: [
        "Implemented a component-driven UI with 45 reusable atomic clients.",
        "Led design and development of an internal application and three efficiency By 32%.",
      ],
    },
    {
      company: "Front-end Developer - Simply",
      location: "New Tashkent, Tashkent",
      period: "March - present",
      responsibilities: [
        "Implemented a component-driven UI with 45 reusable atomic clients.",
        "Led design and development of an internal application and three efficiency By 32%.",
      ],
    },
    {
      company: "Front-end Developer - Simply",
      location: "New Tashkent, Tashkent",
      period: "March - present",
      responsibilities: [
        "Implemented a component-driven UI with 45 reusable atomic clients.",
        "Led design and development of an internal application and three efficiency By 32%.",
      ],
    },
  ];

  const techStack = [
    { name: "JavaScript", logo: "JS", color: "bg-yellow-400 text-black" },
    { name: "TypeScript", logo: "TS", color: "bg-blue-500 text-white" },
    { name: "Python", logo: "Py", color: "bg-blue-400 text-white" },
    { name: "Golang", logo: "Go", color: "bg-cyan-400 text-black" },
    { name: "HTML", logo: "5", color: "bg-orange-500 text-white" },
    { name: "CSS", logo: "3", color: "bg-purple-500 text-white" },
  ];

  const education = [
    {
      school: "Ahmadu Bello University",
      degree: "Bsc Computer Science",
      period: "March - present",
    },
    {
      school: "Ahmadu Bello University",
      degree: "Bsc Computer Science",
      period: "March - present",
    },
    {
      school: "Ahmadu Bello University",
      degree: "Bsc Computer Science",
      period: "March - present",
    },
    {
      school: "Ahmadu Bello University",
      degree: "Bsc Computer Science",
      period: "March - present",
    },
  ];

  const certifications = [
    { title: "Google UX Design Certificate", org: "Google Coursera", year: "2023" },
    { title: "Meta Front End Professional", org: "Amazon Web Services", year: "2022" },
  ];

  const referees = [
    {
      name: "Fatima Ahmad",
      title: "Software Engineer, Simply",
      email: "fatima.ahmad@example.com",
      phone: "+2348011111***",
    },
    {
      name: "Fatima Ahmad",
      title: "Software Engineer, Simply",
      email: "fatima.ahmad@example.com",
      phone: "+2348011111***",
    },
    {
      name: "Fatima Ahmad",
      title: "Software Engineer, Simply",
      email: "fatima.ahmad@example.com",
      phone: "+2348011111***",
    },
  ];

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="mb-2">Yasir</h1>
        <p className="text-white/80 mb-6">Full Stack Developer</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
          <span>📧 Info.yasirahmed.com</span>
          <span>🔗 https://yasirahmed.com</span>
          <span>📧 Fatimah.yasirahmed.com</span>
          <span>🔗 Workinpa3@ahmadu.com</span>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 border-b border-white/20 pb-3">
          Professional Experience
        </h2>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{exp.company}</h3>
                  <p className="text-white/60 text-sm">{exp.location}</p>
                </div>
                <span className="text-white/60 text-sm">{exp.period}</span>
              </div>
              <ul className="list-disc list-inside text-white/80 space-y-1 ml-4">
                {exp.responsibilities.map((resp, i) => (
                  <li key={i} className="text-sm">{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 border-b border-white/20 pb-3">
          Professional summary
        </h2>
        <p className="text-white/80">
          I'm a results-driven developer with 4 years of experience designing, developing, and deploying modern web applications using Node, React, & PHP. Specializing in both server and web front-end development. Seeking to utilize broad educational background with excellent analytical, technical, and building products.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 border-b border-white/20 pb-3">
          My Tech Stack
        </h2>
        <p className="text-white/60 mb-6 text-sm">
          The core technologies and tools that power my development workflow — from front end to deployment.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {techStack.map((tech, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 ${tech.color} rounded-lg flex items-center justify-center text-2xl font-bold`}>
                {tech.logo}
              </div>
              <span className="text-sm text-white/80">{tech.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 border-b border-white/20 pb-3">
          Education
        </h2>
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{edu.school}</h3>
                <p className="text-white/60 text-sm">{edu.degree}</p>
              </div>
              <span className="text-white/60 text-sm">{edu.period}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-6 border-b border-white/20 pb-3">
          Certifications & Awards
        </h2>
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{cert.title}</h3>
                <p className="text-white/60 text-sm">{cert.org}</p>
              </div>
              <span className="text-white/60 text-sm">{cert.year}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 border-b border-white/20 pb-3">
          Referees
        </h2>
        <div className="space-y-6">
          {referees.map((ref, index) => (
            <div key={index}>
              <h3 className="font-semibold">{ref.name}</h3>
              <p className="text-white/60 text-sm mb-1">{ref.title}</p>
              <div className="flex gap-4 text-sm text-white/70">
                <span>{ref.email}</span>
                <span>{ref.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
