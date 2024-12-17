'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LucideArrowDown,
  LucideArrowRight,
  LucideHeart,
  LucideMessageCircleQuestion,
  LucidePackage,
  LucidePiggyBank,
  LucideSquareFunction,
} from 'lucide-react'
import IconEmail from '~icons/mdi/email-outline.jsx'
import IconGithub from '~icons/mdi/github.jsx'
import IconEsbuild from '~icons/simple-icons/esbuild.jsx'
import IconGithubSponsors from '~icons/simple-icons/githubsponsors.jsx'
import ReplStarterDialog from '@/components/repl-starter-dialog'
import { Button } from '@/components/ui/button'
import { SystemRepls } from '@/lib/repl-stored-state/system-repls'
import Demo from './components/demo'
import { FaqItem } from './components/faq-item'
import FeatureBox from './components/feature-box'

function getReplLink(replId: string) {
  return `/repl/${replId}`
}

export default function Home() {
  const [starterDialogOpen, setStarterDialogOpen] = useState(false)

  return (
    <>
      <div className="container flex items-center gap-x-6 gap-y-12 pt-8 max-lg:flex-col-reverse">
        <div className="flex flex-col gap-6 lg:basis-1/2">
          <span className="flex items-center justify-center self-start rounded-sm bg-gradient-to-br from-lime-600 to-yellow-600 px-3 py-1.5 font-medium leading-none">
            alpha version
          </span>

          <h1 className="text-primary whitespace-nowrap text-5xl font-bold leading-snug max-md:text-4xl [&>.typed-cursor]:inline-block [&>.typed-cursor]:-translate-y-0.5 [&>.typed-cursor]:font-normal">
            <span className="text-[3.2rem]">JavaScript</span>
            <br />
            <span className="text-stone-200">REPL & Playground</span>
          </h1>

          <div>
            <p className="text-2xl max-md:text-xl dark:text-gray-400">
              Quickly test and share your code snippets.
              <br />
              Ideal for learning and prototyping.
            </p>
          </div>

          <div className="mt-4 flex gap-4 max-md:flex-col">
            <Button size="lg" onClick={scrollDownToLearnMore}>
              Scroll down to learn more
              <LucideArrowDown size={18} className="ml-2" />
            </Button>

            <Button size="lg" variant="ghost-primary" onClick={() => setStarterDialogOpen(true)}>
              Go to the Playground
              <LucideArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>

        <Image
          className="min-w-0 max-lg:w-[31.25rem] lg:basis-1/2"
          src="/assets/landing-hero.png"
          alt="Landing hero image"
          width={1266}
          height={967}
          sizes="(max-width: 1024px) min(100vw, 31.25rem), min(50vw, 656px)"
          priority
        />
      </div>

      <div
        id="features"
        className="container mt-16 grid scroll-mt-24 grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1"
      >
        <FeatureBox
          icon={<LucideSquareFunction size={24} className="text-primary" />}
          title={
            <>
              Get <span className="gradient-text">instant feedback</span> as you type
            </>
          }
          description="The results of JavaScript and TypeScript expressions are displayed in real time."
          code={
            <>
              <span style={{ color: '#ffd700' }}>&#123;&#125;</span> +{' '}
              <span style={{ color: '#ffd700' }}>&#91;&#93;</span>{' '}
              <span style={{ color: '#666' }}>{'// → 0'}</span>
            </>
          }
          codeVariants={
            <>
              <p>
                <span style={{ color: '#ffd700' }}>&#123;&#125;</span> +{' '}
                <span style={{ color: '#ffd700' }}>&#123;&#125;</span>{' '}
                <span style={{ color: '#666' }}>{'// → NaN'}</span>
              </p>
              <p>
                <span style={{ color: '#ffd700' }}>&#91;&#93;</span> +{' '}
                <span style={{ color: '#ffd700' }}>&#91;&#93;</span>{' '}
                <span style={{ color: '#666' }}>{"// → ''"}</span>
              </p>
              <p>
                <span style={{ color: '#ffd700' }}>&#91;&#93;</span> +{' '}
                <span style={{ color: '#ffd700' }}>&#123;&#125;</span>{' '}
                <span style={{ color: '#666' }}>{"// → '[object Object]'"}</span>
              </p>
              <p>
                <span style={{ color: '#9cdcfe' }}>Math</span>
                <span style={{ color: '#d4d4d4' }}>.</span>
                <span style={{ color: '#dcdcaa' }}>max()</span>{' '}
                <span style={{ color: '#666' }}>{'// → -Infinity'}</span>
              </p>
              <p>
                <span style={{ color: '#569cd6' }}>typeof</span>{' '}
                <span style={{ color: '#569cd6' }}>NaN</span>{' '}
                <span style={{ color: '#666' }}>{"// → 'number'"}</span>
              </p>
            </>
          }
        />

        <FeatureBox
          icon={<IconEsbuild width={24} height={24} className="text-primary" />}
          title={
            <>
              Powered by <span className="gradient-text">esbuild</span>
            </>
          }
          description={
            <>Experience ECMAScript modules and TypeScript in a multi-file editing environment.</>
          }
          code={
            <>
              <span style={{ color: '#c586c0' }}>import</span>{' '}
              <span style={{ color: '#ce9178' }}>&apos;./index.css&apos;</span>
            </>
          }
          codeVariants={
            <>
              <p>
                <span style={{ color: '#c586c0' }}>import</span>{' '}
                <span style={{ color: '#ffd700' }}>&#123;</span>{' '}
                <span style={{ color: '#9cdcfe' }}>deepClone</span>{' '}
                <span style={{ color: '#ffd700' }}>&#125;</span>{' '}
                <span style={{ color: '#c586c0' }}>from</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;./src/utils&apos;</span>
              </p>
              <p>
                <span style={{ color: '#c586c0' }}>import</span>{' '}
                <span style={{ color: '#9cdcfe' }}>Button</span>{' '}
                <span style={{ color: '#c586c0' }}>from</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;./button.tsx&apos;</span>
              </p>
            </>
          }
        />

        <FeatureBox
          icon={<LucidePackage size={24} className="text-primary" />}
          title={
            <>
              Use <span className="gradient-text">NPM packages</span> with ease
            </>
          }
          description={
            <>
              Just import them in the code.
              <br />
              There is no step 2. Types included.
            </>
          }
          code={
            <>
              <span style={{ color: '#c586c0' }}>import</span>{' '}
              <span style={{ color: '#9cdcfe' }}>smth</span>{' '}
              <span style={{ color: '#c586c0' }}>from</span>{' '}
              <span style={{ color: '#ce9178' }}>&apos;npm-package&apos;</span>
            </>
          }
          codeVariants={
            <>
              <p>
                <span style={{ color: '#c586c0' }}>import</span>{' '}
                <span style={{ color: '#ffd700' }}>&#123;</span>
                <span style={{ color: '#9cdcfe' }}> format </span>
                <span style={{ color: '#ffd700' }}>&#125;</span>{' '}
                <span style={{ color: '#c586c0' }}>from</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;date-fns&apos;</span>
              </p>
              <p>
                <span style={{ color: '#c586c0' }}>import</span>{' '}
                <span style={{ color: '#9cdcfe' }}>React</span>{' '}
                <span style={{ color: '#c586c0' }}>from</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;react&apos;</span>
              </p>
              <p>
                <span style={{ color: '#c586c0' }}>import</span>{' '}
                <span style={{ color: '#9cdcfe' }}>axios</span>{' '}
                <span style={{ color: '#c586c0' }}>from</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;axios&apos;</span>
              </p>
              <p>
                <span style={{ color: '#c586c0' }}>import</span>{' '}
                <span style={{ color: '#9cdcfe' }}>confetti</span>{' '}
                <span style={{ color: '#c586c0' }}>from</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;canvas-confetti&apos;</span>
              </p>
            </>
          }
        />

        <FeatureBox
          icon={
            <svg
              role="img"
              viewBox="0 0 54 33"
              height="22"
              width="22"
              className="text-primary"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
                clipRule="evenodd"
              />
            </svg>
          }
          title={
            <>
              <span className="gradient-text">Tailwind CSS</span> for fast prototyping
            </>
          }
          description={
            <>
              We live in modern times, don&apos;t we?
              <br />
              Tailwind CSS is enabled by default. IntelliSense included.
            </>
          }
          code={
            <>
              <span style={{ color: '#808080' }}>&lt;</span>
              <span style={{ color: '#569cd6' }}>div</span>
              <span style={{ color: '#9cdcfe' }}> class</span>
              <span style={{ color: '#d4d4d4' }}>=</span>
              <span style={{ color: '#ce9178' }}>&quot;text-xl&quot;</span>
              <span style={{ color: '#808080' }}>&gt;</span>
              jsrepl.io
              <span style={{ color: '#808080' }}>&lt;/</span>
              <span style={{ color: '#569cd6' }}>div</span>
              <span style={{ color: '#808080' }}>&gt;</span>
            </>
          }
          codeVariants={
            <>
              <p>
                <span style={{ color: '#c586c0' }}>@apply</span>{' '}
                <span
                  style={{
                    backgroundColor: '#a8a29e',
                    width: '10px',
                    height: '10px',
                    display: 'inline-block',
                    margin: '0 3px',
                    border: '1px solid #eee',
                  }}
                />
                <span style={{ color: '#ce9178' }}>dark:text-stone-400</span>;
              </p>
              <p>
                <span style={{ color: '#c586c0' }}>@tailwind</span>{' '}
                <span style={{ color: '#ce9178' }}>base</span>;
              </p>
            </>
          }
        />

        <FeatureBox
          icon={
            <svg
              role="img"
              viewBox="0 0 24 24"
              height="20"
              width="20"
              className="fill-primary"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Prettier</title>
              <path d="M8.571 23.429A.571.571 0 0 1 8 24H2.286a.571.571 0 0 1 0-1.143H8c.316 0 .571.256.571.572zM8 20.57H6.857a.571.571 0 0 0 0 1.143H8a.571.571 0 0 0 0-1.143zm-5.714 1.143H4.57a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zM8 18.286H2.286a.571.571 0 0 0 0 1.143H8a.571.571 0 0 0 0-1.143zM16 16H5.714a.571.571 0 0 0 0 1.143H16A.571.571 0 0 0 16 16zM2.286 17.143h1.143a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zm17.143-3.429H16a.571.571 0 0 0 0 1.143h3.429a.571.571 0 0 0 0-1.143zM9.143 14.857h4.571a.571.571 0 0 0 0-1.143H9.143a.571.571 0 0 0 0 1.143zm-6.857 0h4.571a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zM20.57 11.43H11.43a.571.571 0 0 0 0 1.142h9.142a.571.571 0 0 0 0-1.142zM9.714 12a.571.571 0 0 0-.571-.571H5.714a.571.571 0 0 0 0 1.142h3.429A.571.571 0 0 0 9.714 12zm-7.428.571h1.143a.571.571 0 0 0 0-1.142H2.286a.571.571 0 0 0 0 1.142zm19.428-3.428H16a.571.571 0 0 0 0 1.143h5.714a.571.571 0 0 0 0-1.143zM2.286 10.286H8a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zm13.143-2.857c0 .315.255.571.571.571h5.714a.571.571 0 0 0 0-1.143H16a.571.571 0 0 0-.571.572zm-8.572-.572a.571.571 0 0 0 0 1.143H8a.571.571 0 0 0 0-1.143H6.857zM2.286 8H4.57a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zm16.571-2.857c0 .315.256.571.572.571h1.142a.571.571 0 0 0 0-1.143H19.43a.571.571 0 0 0-.572.572zm-1.143 0a.571.571 0 0 0-.571-.572H12.57a.571.571 0 0 0 0 1.143h4.572a.571.571 0 0 0 .571-.571zm-15.428.571h8a.571.571 0 0 0 0-1.143h-8a.571.571 0 0 0 0 1.143zm5.143-2.857c0 .316.255.572.571.572h11.429a.571.571 0 0 0 0-1.143H8a.571.571 0 0 0-.571.571zm-5.143.572h3.428a.571.571 0 0 0 0-1.143H2.286a.571.571 0 0 0 0 1.143zm0-2.286H16A.571.571 0 0 0 16 0H2.286a.571.571 0 0 0 0 1.143z" />
            </svg>
          }
          title={
            <>
              <span className="gradient-text">Prettier</span> for code formatting
            </>
          }
          description="Because you shouldn't waste time on formatting while prototyping."
          code={
            <>
              <span style={{ color: '#569cd6' }}>const</span>{' '}
              <span style={{ color: '#4fc1ff' }}>a</span>
              <span style={{ color: '#d4d4d4' }}>=</span>
              <span style={{ color: '#ffd700' }}>[</span>
              <span style={{ color: '#b5cea8' }}>1</span>
              <span style={{ color: '#d4d4d4' }}>,</span>
              <span style={{ color: '#b5cea8' }}>2</span>
              <span style={{ color: '#d4d4d4' }}>,</span>
              <span style={{ color: '#ce9178' }}>&quot;a&quot;</span>
              <span style={{ color: '#d4d4d4' }}>,</span>
              <span style={{ color: '#da70d6' }}>&#123; &#125;</span>
              <span style={{ color: '#ffd700' }}>]</span>
              <span style={{ color: '#666' }}>{'·······'}</span>
            </>
          }
          codeVariants={
            <>
              <p>
                <span style={{ color: '#569cd6' }}>const</span>{' '}
                <span style={{ color: '#4fc1ff' }}>a</span>{' '}
                <span style={{ color: '#d4d4d4' }}>=</span>{' '}
                <span style={{ color: '#ffd700' }}>[</span>
                <span style={{ color: '#b5cea8' }}>1</span>
                <span style={{ color: '#d4d4d4' }}>,</span>{' '}
                <span style={{ color: '#b5cea8' }}>2</span>
                <span style={{ color: '#d4d4d4' }}>,</span>{' '}
                <span style={{ color: '#ce9178' }}>&apos;a&apos;</span>
                <span style={{ color: '#d4d4d4' }}>,</span>{' '}
                <span style={{ color: '#da70d6' }}>&#123;&#125;</span>
                <span style={{ color: '#ffd700' }}>]</span>;
              </p>
            </>
          }
        />

        <FeatureBox
          icon={
            <svg
              height="22"
              width="22"
              className="fill-primary"
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>React</title>
              <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
            </svg>
          }
          title={
            <>
              <span className="gradient-text">React & JSX/TSX</span> is ready to go
            </>
          }
          description="Prototype dynamic UIs with React and JSX, experiment with reactivity."
          code={
            <>
              <span style={{ color: '#808080' }}>&lt;</span>
              <span style={{ color: '#569cd6' }}>h1</span>
              <span style={{ color: '#808080' }}>&gt;</span>Hello,{' '}
              <span style={{ color: '#da70d6' }}>{'{'}</span>
              <span style={{ color: '#9cdcfe' }}>name</span>
              <span style={{ color: '#da70d6' }}>{'}'}</span>
              <span style={{ color: '#808080' }}>&lt;/</span>
              <span style={{ color: '#569cd6' }}>h1</span>
              <span style={{ color: '#808080' }}>&gt;</span>
            </>
          }
          codeVariants={
            <>
              <p>
                <span style={{ color: '#808080' }}>&lt;</span>
                <span style={{ color: '#569cd6' }}>img</span>
                <span style={{ color: '#9cdcfe' }}> src</span>
                <span style={{ color: '#d4d4d4' }}>=</span>
                <span style={{ color: '#da70d6' }}>&#123;</span>
                <span style={{ color: '#9cdcfe' }}>user.avatarUrl</span>
                <span style={{ color: '#da70d6' }}>&#125;</span>
                <span style={{ color: '#808080' }}> /&gt;</span>
              </p>
              <p>
                <span style={{ color: '#808080' }}>&lt;</span>
                <span style={{ color: '#569cd6' }}>li</span>
                <span style={{ color: '#9cdcfe' }}> className</span>
                <span style={{ color: '#d4d4d4' }}>=</span>
                <span style={{ color: '#ce9178' }}>&quot;item&quot;</span>
                <span style={{ color: '#808080' }}>&gt;</span>
                <span style={{ color: '#da70d6' }}>&#123;</span>
                <span style={{ color: '#9cdcfe' }}>name</span>
                <span style={{ color: '#da70d6' }}>&#125;</span>
                <span style={{ color: '#808080' }}>&lt;/</span>
                <span style={{ color: '#569cd6' }}>li</span>
                <span style={{ color: '#808080' }}>&gt;</span>
              </p>
            </>
          }
        />
      </div>

      <div className="container my-20 space-y-16 text-center font-medium text-gray-300">
        <div>
          <h2 className="text-primary text-2xl font-semibold">This is all free and open source</h2>
          <p>No login / registration required.</p>
        </div>
        <div>
          <h2 className="text-primary text-2xl font-semibold">It works right in your browser</h2>
          <p>
            I mean it works <i>right in your browser</i>.
          </p>
          <p>The playground powered by client-side JavaScript and WebAssembly.</p>
        </div>
        <p></p>
      </div>

      <div className="container mt-16 text-center font-medium text-gray-300">
        See the features in action:
      </div>

      <div id="demos" className="container mt-16 flex flex-col gap-16">
        <Demo
          replLink={getReplLink(SystemRepls.demoLiveFeedback)}
          title="Live feedback"
          text={
            <>
              <p>
                JavaScript expressions are evaluated and their results are displayed in real time
                instantly. Live feedback gives you tangible productivity boost when prototyping.
              </p>
              <p>
                You still have the power to debug your code using <span>d</span>ebugger statements,
                thanks to the source maps, and, of course, you can use your favorite{' '}
                <code>console.log</code> just as you like :).
              </p>
            </>
          }
          media={({ videoProps }) => (
            <video
              {...videoProps}
              src="/assets/landing-demo-repl.mp4"
              poster="/assets/landing-demo-repl.png"
            />
          )}
        />

        <Demo
          replLink={getReplLink(SystemRepls.demoNpmPackages)}
          title="NPM packages"
          text={
            <>
              <p>
                There&apos;s no need to dance around it. Just import NPM packages in the code as you
                do it normally, but only skipping the step of installing them.
              </p>
              <p>
                Package types (if provided) will be automatically available for IntelliSense in the
                editor.
              </p>
            </>
          }
          media={({ videoProps }) => (
            <video
              {...videoProps}
              src="/assets/landing-demo-npm.mp4"
              poster="/assets/landing-demo-npm.png"
            />
          )}
        />

        <Demo
          replLink={getReplLink(SystemRepls.demoBrowserEnv)}
          title="Browser environment"
          text={
            <>
              <p>
                The code is executed in the browser environment, so you have full DOM access, and
                all the browser APIs available.
              </p>
              <p>Enjoy tinkering with HTML and see the result in the Preview window.</p>
            </>
          }
          media={({ videoProps }) => (
            <video
              {...videoProps}
              src="/assets/landing-demo-browserenv.mp4"
              poster="/assets/landing-demo-browserenv.png"
            />
          )}
        />

        <Demo
          replLink={getReplLink(SystemRepls.demoTypescript)}
          title="TypeScript"
          text={
            <>
              <p>
                TypeScript is on board. Monaco editor gives you amazing IntelliSense & code
                completion out of the box.
              </p>
            </>
          }
          media={({ imgProps }) => (
            <img {...imgProps} src="/assets/landing-demo-typescript.png" alt="" />
          )}
        />

        <Demo
          replLink={getReplLink(SystemRepls.demoTailwindcss)}
          title="Tailwind CSS"
          text={
            <>
              <p>
                Tailwind CSS is enabled by default. It works as you expect: in TS/TSX, HTML, and
                CSS. Tailwind CSS IntelliSense (autocomplete, linting, hover previews) works as
                well.
              </p>
              <p>
                The Preview window sets the{' '}
                <Link
                  target="_blank"
                  className="underline"
                  href="https://tailwindcss.com/docs/dark-mode"
                >
                  Dark Mode
                </Link>{' '}
                for you, if you use a dark theme in the editor.
              </p>
            </>
          }
          media={({ videoProps }) => (
            <video
              {...videoProps}
              src="/assets/landing-demo-tailwindcss.mp4"
              poster="/assets/landing-demo-tailwindcss.png"
            />
          )}
        />

        <Demo
          replLink={getReplLink(SystemRepls.demoReact)}
          title="React & JSX/TSX"
          text={
            <>
              <p>
                You can use React & React JSX in the code to tinker with dynamic UIs & reactive
                state.
              </p>
            </>
          }
          media={({ videoProps }) => (
            <video
              {...videoProps}
              src="/assets/landing-demo-reactjsx.mp4"
              poster="/assets/landing-demo-reactjsx.png"
            />
          )}
        />

        <Demo
          title="Themes"
          text={
            <>
              <p>We all love themes. JSREPL offers some themes to choose from.</p>
              <p>The one used here in videos is Monokai.</p>
            </>
          }
          media={({ imgProps }) => (
            <img {...imgProps} src="/assets/landing-demo-themes.png" alt="" />
          )}
        />

        <Demo
          title="Security"
          text={
            <>
              <p>
                You can share your Repl with anyone, and others can share theirs with you. Security
                is crucial when executing untrusted code. The code runs in a cross-domain iframe,
                which do not have access to anything sensitive outside the untrusted domain.
              </p>
            </>
          }
          media={({ imgProps }) => (
            <img {...imgProps} src="/assets/landing-demo-security.png" alt="" />
          )}
        />
      </div>

      <div className="container mt-32 text-white/85 max-md:mt-20">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          FAQ{' '}
          <LucideMessageCircleQuestion
            className="mx-1 inline-block -translate-y-0.5 text-blue-400"
            size={28}
          />
        </h2>
        <div className="mx-auto w-full max-w-prose space-y-8">
          <FaqItem title="What">
            <p>
              JSREPL is a simple, easy-to-use, yet modern playground for JavaScript and TypeScript
              code. It allows you to write, run, and share code snippets.
            </p>
            <p>
              Although it allows you to use HTML, CSS, TailwindCSS, NPM packages, ESM modules, and
              React JSX/TSX, the main feature is the Live Feedback, which lets you see the results
              of JavaScript expressions in real time.
            </p>
          </FaqItem>
          <FaqItem title="Why">
            <p>
              The essence of JSREPL is to offer a playground that allows you to test your frontend
              code snippets quickly and without distractions, such as the need to set up a (complex)
              development environment.
            </p>
            <p>
              It&apos;s not a replacement for StackBlitz or your IDE. The main goal and key metric
              is how simple and fast you can play with something, say copy-paste a code snippet from
              MDN, StackOverflow, GitHub Issues, ChatGPT, or whatever, and check the result.
            </p>
            <p>
              You don&apos;t need to log in or register. You don&apos;t need to install npm packages
              you want to play with. The results of JavaScript expressions displayed in real time
              allow you to go without <code>console.log</code>ing all the things. And you still have
              all the power to keep browser devtools open and use <code>debugger</code> statements
              to debug your code.
            </p>
          </FaqItem>
          <FaqItem title="How">
            <p>
              First of all, (obviously), it is not a replacement for browser devtools & debugger.
              <br />
              JSREPL does not interpret your code by itself. Your code is executed in the real
              browser environment within an iframe. The magic happens behind the AST transformations
              at build time and logging stuff in runtime.
            </p>
            <p>
              The playground powered by client-side JavaScript and WebAssembly, and literally works
              right in your browser.
            </p>
          </FaqItem>
        </div>
      </div>

      <div className="container mt-32 text-gray-300 max-md:mt-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white/85">
          Made with{' '}
          <LucideHeart fill="currentColor" className="mx-1 inline-block text-red-500" size={28} />{' '}
          by
        </h2>

        <div className="mx-auto flex w-full max-w-96 flex-col items-center gap-4 rounded-xl bg-zinc-800 p-6 text-center text-white/85">
          <img
            src="https://github.com/nag5000.png?size=192"
            alt="Aleksei Nagovitsyn"
            width="64"
            height="64"
            className="rounded-full"
          />

          <h3 className="text-xl font-medium">Aleksei Nagovitsyn</h3>

          <p className="text-balance text-sm text-gray-400">
            Creator of JSREPL.io &<br />
            Web software engineer @hyperskill
          </p>

          <p className="flex">
            <Button asChild size="icon" variant="ghost">
              <Link href="https://github.com/nag5000" target="_blank">
                <IconGithub width={24} height={24} className="opacity-80" />
              </Link>
            </Button>

            <Button asChild size="icon" variant="ghost">
              <Link href="https://github.com/sponsors/nag5000" target="_blank">
                <IconGithubSponsors
                  width={22}
                  height={22}
                  className="opacity-80 hover:text-[#bf3989]"
                />
              </Link>
            </Button>

            <Button asChild size="icon" variant="ghost">
              <Link href="mailto:contact@jsrepl.io" target="_blank">
                <IconEmail width={24} height={24} className="opacity-80" />
              </Link>
            </Button>
          </p>

          <Link href="https://buymeacoffee.com/nag5000" target="_blank">
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              width="217"
              height="60"
              className="max-w-40"
            />
          </Link>
        </div>
      </div>

      <div className="container mt-32 text-gray-300 max-md:mt-20">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white/85">
          Donate{' '}
          <LucidePiggyBank
            className="mx-1 inline-block -translate-y-0.5 text-green-400"
            size={32}
          />
        </h2>
        <div className="mx-auto w-full max-w-prose rounded-xl bg-zinc-800 p-6 text-center text-white/85 underline-offset-4">
          If you like the project, consider giving it a ⭐️ on{' '}
          <Link
            href="https://github.com/jsrepl/jsrepl.io"
            target="_blank"
            className="text-primary hover:underline"
          >
            GitHub
          </Link>{' '}
          <div className="border-border mx-auto mb-px mt-3 w-8 border-t" />
          or
          <div className="border-border mx-auto mb-3 mt-0.5 w-8 border-t" />
          make a small donation 💖
          <br />
          <Link
            href="https://github.com/sponsors/nag5000"
            target="_blank"
            className="text-primary hover:underline"
          >
            https://github.com/sponsors/nag5000
          </Link>{' '}
          /{' '}
          <Link
            href="https://buymeacoffee.com/nag5000"
            target="_blank"
            className="text-primary hover:underline"
          >
            https://buymeacoffee.com/nag5000
          </Link>
          <br />
          to support the development and help cover some of the costs of the domain and running the
          service.
          <br />
          <br />
          JSREPL is a side project, and I work on it in my free time.
          <br />
          It is free for everyone, and will remain free.
          <br />
          Your support means a lot to me. Thank you!
        </div>
      </div>

      <div className="container mt-32 text-center font-medium text-gray-300 max-md:mt-20">
        That&apos;s it! Looks interesting? Give it a try! For prototyping, for learning, or just for
        fun.
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button size="lg" onClick={() => setStarterDialogOpen(true)}>
            Go to the Playground
          </Button>
          <Button size="lg" variant="ghost-primary" onClick={scrollToTop}>
            Back to Top ↑
          </Button>
        </div>
      </div>

      <ReplStarterDialog open={starterDialogOpen} onOpenChange={setStarterDialogOpen} />
    </>
  )
}

function scrollDownToLearnMore() {
  const features = document.getElementById('features')
  features?.scrollIntoView({ behavior: 'smooth' })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
