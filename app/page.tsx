import Image from 'next/image';
import Link from 'next/link';
import heroImage from '@/public/chapel-hero.jpg';

export default function HomePage() {
  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
      <section className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
        <Image
          src={heroImage}
          alt="Three lit arched chapel windows glowing against an evening sky"
          width={1600}
          height={900}
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="h-56 w-full object-cover sm:h-72"
          placeholder="blur"
        />
        <div className="p-6 sm:p-8">
          <h1 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Sacrament Meeting Planner
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-700">
            Plan each Sunday&apos;s agenda in one place — announcements, hymns, prayers, ward
            business, speakers, and musical numbers — then review or print the program for members.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/meetings"
              className="rounded-md bg-sky-800 px-5 py-2.5 font-semibold text-white hover:bg-sky-900"
            >
              Browse all meetings
            </Link>
            <Link
              href="/meetings/current"
              className="rounded-md border border-slate-400 bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-100"
            >
              This Sunday&apos;s program
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="mt-10">
        <h2 id="features-heading" className="font-serif text-2xl font-bold text-slate-900">
          What the planner tracks
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Announcements', body: 'Ward and stake notices read at the start of the meeting.' },
            { title: 'Hymns', body: 'Opening, sacrament, and closing hymns with hymnbook numbers.' },
            { title: 'Prayers', body: 'Members invited to offer the opening and closing prayers.' },
            { title: 'Ward business', body: 'Sustainings, releases, and confirmations, plus stake business.' },
            { title: 'Speakers', body: 'Assigned speakers and their topics, in program order.' },
            { title: 'Musical numbers', body: 'Choir and special musical selections between speakers.' },
          ].map((feature) => (
            <li
              key={feature.title}
              className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-700">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
