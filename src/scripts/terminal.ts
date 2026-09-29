import { appById, type AppId } from '@/data/apps';
import { projects, type Project } from '@/data/projects';
import { principles, profile, stackGroups } from '@/data/site';
import * as actions from './actions';
import { must } from './lib';
import { getTheme, setTheme } from './theme';
import { closeApp, type WindowEvent } from './windows';

/** A piece of a terminal line: plain text, coloured text, or a link. */
type Seg = string | { t: string; c?: string; href?: string };

/** Commands are grouped in `help` so a newcomer sees "what can I actually do" before a wall of text. */
type Group = 'Look around' | 'This page' | 'Session';

type Command = { usage: string; desc: string; group: Group; run: (args: string[]) => void };

const GROUP_ORDER: Group[] = ['Look around', 'This page', 'Session'];

const strip = (value: string): string => value.toLowerCase().replace(/\.(app|webloc|apk)$/, '').trim();

function findProject(query: string): Project | undefined {
  const q = strip(query).replace(/[\s_]+/g, '-');
  if (!q) return undefined;
  return (
    projects.find((p) => p.slug === q || strip(p.filename).replace(/[\s_]+/g, '-') === q) ??
    projects.find((p) => p.slug.startsWith(q) || strip(p.name).replace(/\s+/g, '-').startsWith(q))
  );
}

const appAliases: Record<string, AppId> = {
  finder: 'finder',
  projects: 'finder',
  gallery: 'finder',
  contacts: 'contacts',
  about: 'contacts',
  me: 'contacts',
  notes: 'notes',
  principles: 'notes',
  mail: 'mail',
  email: 'mail',
  terminal: 'terminal',
};

export function initTerminal(): void {
  const root = must('[data-terminal]');
  const screen = must('[data-terminal-screen]', root);
  const out = must('[data-terminal-out]', root);
  const form = must<HTMLFormElement>('[data-terminal-form]', root);
  const input = must<HTMLInputElement>('[data-terminal-input]', root);
  const promptLabel = must('[data-terminal-prompt]', root);

  const history: string[] = [];
  let cursor = 0;
  const started = performance.now();

  /** The "directory" you're in: `cd <project>` sets it, `cd` or `cd ..` clears it.
   *  There's no real filesystem — this just lets `ls`, `cat`, and `open` default to
   *  whichever project you last `cd`'d into, the way a real shell would. */
  let cwd: Project | null = null;

  const promptText = (): string => `guest@mooketsi ~${cwd ? `/${cwd.slug}` : ''} %`;
  const syncPrompt = () => {
    promptLabel.textContent = promptText();
  };

  /* ----------------------------------------------------------------------
     Output
     ---------------------------------------------------------------------- */
  const row = (...segs: Seg[]): void => {
    const line = document.createElement('div');
    line.className = 'row';
    segs.forEach((seg) => {
      if (typeof seg === 'string') return line.append(seg);
      const node = seg.href ? document.createElement('a') : document.createElement('span');
      node.textContent = seg.t;
      if (seg.c) node.className = seg.c;
      if (node instanceof HTMLAnchorElement && seg.href) {
        node.href = seg.href;
        if (seg.href.startsWith('http')) {
          node.target = '_blank';
          node.rel = 'noopener noreferrer';
        }
      }
      line.append(node);
    });
    out.append(line);
  };

  const blank = () => row('');
  const scrollDown = () => {
    screen.scrollTop = screen.scrollHeight;
  };
  const pad = (value: string, width: number) => value.padEnd(width, ' ');

  /** `cat`/`open`/`ls` all resolve a project the same way: an explicit argument first, else the
   *  current `cd`'d project, else (for `open`) none. Returns undefined and prints nothing itself —
   *  callers decide what "no project" means for them. */
  const resolveProject = (args: string[]): Project | undefined => (args.length ? findProject(args.join(' ')) : (cwd ?? undefined));

  function printProject(project: Project): void {
    row({ t: project.name, c: 't-strong' }, { t: `  ·  ${project.kind}`, c: 't-dim' });
    row({ t: project.kicker, c: 't-accent' });
    blank();
    row(project.story);
    blank();
    row({ t: 'built with  ', c: 't-dim' }, project.stack.join(' · '));
    row({ t: 'evidence    ', c: 't-dim' }, project.evidence);
    if (project.next) row({ t: 'next        ', c: 't-dim' }, project.next);
    row({ t: 'screens     ', c: 't-dim' }, `${project.shots.length} — cd ${project.slug} && ls to see their names`);
    row({ t: 'source      ', c: 't-dim' }, { t: project.repository, href: project.repository });
  }

  /* ----------------------------------------------------------------------
     Commands
     ---------------------------------------------------------------------- */
  const commands: Record<string, Command> = {
    help: {
      usage: 'help',
      desc: 'show this list',
      group: 'Session',
      run: () => {
        row('This is a real (if small) command line — everything it shows is also one click');
        row('away in Finder, Notes, or Mail, if you’d rather point and click. Nothing here');
        row('changes or deletes anything.');
        blank();
        GROUP_ORDER.forEach((group) => {
          row({ t: group, c: 't-strong' });
          Object.values(commands)
            .filter((c) => c.group === group)
            .forEach((command) => row('  ', { t: pad(command.usage, 22), c: 't-accent' }, { t: command.desc, c: 't-dim' }));
          blank();
        });
        row({ t: 'Good first commands: ', c: 't-dim' }, { t: 'ls', c: 't-accent' }, ', then ', { t: 'cd tsela', c: 't-accent' }, ', then ', { t: 'cat', c: 't-accent' }, '.');
        row({ t: 'Tab completes a name; ↑ / ↓ move through what you’ve typed.', c: 't-dim' });
      },
    },
    ls: {
      usage: 'ls',
      desc: 'list my projects (or, after cd, its screenshots)',
      group: 'Look around',
      run: () => {
        if (cwd) {
          row({ t: `${cwd.name} — ${cwd.shots.length} screenshot${cwd.shots.length === 1 ? '' : 's'}`, c: 't-dim' });
          cwd.shots.forEach((shot, i) => row({ t: pad(`${i + 1}. ${shot.caption}`, 34), c: 't-accent' }, { t: shot.alt, c: 't-dim' }));
          blank();
          row({ t: 'Try: ', c: 't-dim' }, 'open', { t: '   (opens it in the gallery)   or   ', c: 't-dim' }, 'cd ..');
          return;
        }
        row({ t: `total ${projects.length}`, c: 't-dim' });
        projects.forEach((p) => row({ t: pad(p.filename, 30), c: 't-accent' }, { t: p.kind, c: 't-dim' }));
        blank();
        row({ t: 'Try: ', c: 't-dim' }, 'cd tsela', { t: '   then   ', c: 't-dim' }, 'cat');
      },
    },
    cd: {
      usage: 'cd [project]',
      desc: 'step into a project (cd .. to leave)',
      group: 'Look around',
      run: (args) => {
        const target = args.join(' ').trim();
        if (!target || target === '~') {
          cwd = null;
          syncPrompt();
          return;
        }
        if (target === '..' || target === '/') {
          if (!cwd) return row({ t: 'Already at the top — there’s nowhere further up.', c: 't-dim' });
          cwd = null;
          syncPrompt();
          return;
        }
        const project = findProject(target);
        if (!project) return row({ t: `cd: ${target}: no project by that name — try ls to see the list`, c: 't-err' });
        cwd = project;
        syncPrompt();
        row({ t: `Now looking at ${project.name}. `, c: 't-dim' }, { t: 'cat', c: 't-accent' }, { t: ' for the details, ', c: 't-dim' }, { t: 'ls', c: 't-accent' }, { t: ' for its screenshots.', c: 't-dim' });
      },
    },
    cat: {
      usage: 'cat [project]',
      desc: 'read about a project',
      group: 'Look around',
      run: (args) => {
        const project = resolveProject(args);
        if (!project) return row({ t: 'usage: cat <project>   — or cd into one first, then just cat', c: 't-warn' });
        if (args.length && !project) return row({ t: `cat: ${args.join(' ')}: no project by that name — try ls`, c: 't-err' });
        printProject(project);
      },
    },
    open: {
      usage: 'open [name]',
      desc: 'open a project or app on screen',
      group: 'Look around',
      run: (args) => {
        const target = args.join(' ').trim();
        if (!target) {
          if (cwd) {
            row('Opening ', { t: cwd.filename, c: 't-accent' }, ' in the gallery…');
            return actions.openProject(cwd.slug);
          }
          return row({ t: 'usage: open <project|notes|mail|contacts|github>   — or cd into a project first', c: 't-warn' });
        }
        if (['github', 'gh'].includes(target.toLowerCase())) {
          row('Opening ', { t: 'GitHub', c: 't-accent' }, '…');
          return actions.openGitHub();
        }
        const project = findProject(target);
        if (project) {
          row('Opening ', { t: project.filename, c: 't-accent' }, ' in the gallery…');
          return actions.openProject(project.slug);
        }
        const appId = appAliases[target.toLowerCase()];
        if (appId) {
          row('Opening ', { t: appById(appId).title, c: 't-accent' }, '…');
          return actions.openApp(appId);
        }
        row({ t: `open: ${target}: not found — try ls, or open notes / mail / contacts / github`, c: 't-err' });
      },
    },
    stack: {
      usage: 'stack',
      desc: 'what I build with',
      group: 'This page',
      run: () => stackGroups.forEach((group) => row({ t: pad(group.label, 20), c: 't-accent' }, group.items.join(' · '))),
    },
    principles: {
      usage: 'principles',
      desc: 'how I approach the work',
      group: 'This page',
      run: () => {
        principles.forEach((principle, i) => {
          row({ t: `${i + 1}. ${principle.title}`, c: 't-strong' });
          row('   ', { t: principle.body, c: 't-dim' });
          blank();
        });
        row({ t: 'The same list, with the project each one comes from: ', c: 't-dim' }, { t: 'open notes', c: 't-accent' }, '.');
      },
    },
    about: {
      usage: 'about',
      desc: 'who I am',
      group: 'This page',
      run: () => {
        row({ t: profile.headline, c: 't-strong' });
        row(profile.intro);
        blank();
        row({ t: 'role     ', c: 't-dim' }, profile.role);
        row({ t: 'based in ', c: 't-dim' }, profile.location);
        row({ t: 'focus    ', c: 't-dim' }, profile.focus.join(' · '));
      },
    },
    contact: {
      usage: 'contact',
      desc: 'ways to reach me',
      group: 'This page',
      run: () => {
        row({ t: 'email   ', c: 't-dim' }, { t: profile.email, href: `mailto:${profile.email}` });
        row({ t: 'github  ', c: 't-dim' }, { t: profile.github, href: profile.github });
        row({ t: 'where   ', c: 't-dim' }, profile.location);
        blank();
        row({ t: profile.invitation, c: 't-dim' });
      },
    },
    theme: {
      usage: 'theme [light|dark]',
      desc: 'switch light/dark appearance',
      group: 'Session',
      run: ([choice]) => {
        const next = choice === 'light' || choice === 'dark' ? choice : getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
        row('Appearance set to ', { t: next, c: 't-accent' }, '.');
      },
    },
    clear: { usage: 'clear', desc: 'clear the screen', group: 'Session', run: () => out.replaceChildren() },
    history: {
      usage: 'history',
      desc: 'what you’ve typed so far',
      group: 'Session',
      run: () => (history.length ? history.forEach((entry, i) => row({ t: pad(String(i + 1), 5), c: 't-dim' }, entry)) : row({ t: 'Nothing yet.', c: 't-dim' })),
    },
    exit: { usage: 'exit', desc: 'close this window', group: 'Session', run: () => closeApp('terminal') },
  };

  // A couple of harmless easter eggs — not listed in `help`, so they don't clutter a first look.
  const hidden: Record<string, (args: string[]) => void> = {
    pwd: () => row(`/Users/guest${cwd ? `/${cwd.slug}` : ''}`),
    neofetch: () => {
      const art = [' __  __ ', '|  \\/  |', '| |\\/| |', '| |  | |', '|_|  |_|'];
      const uptime = Math.max(1, Math.round((performance.now() - started) / 1000));
      const info: Seg[][] = [
        [{ t: 'guest', c: 't-ok' }, '@', { t: 'mooketsi', c: 't-ok' }],
        [{ t: '-------------', c: 't-dim' }],
        [{ t: 'Name     ', c: 't-accent' }, profile.name],
        [{ t: 'Role     ', c: 't-accent' }, profile.role],
        [{ t: 'Location ', c: 't-accent' }, profile.location],
        [{ t: 'Projects ', c: 't-accent' }, String(projects.length)],
        [{ t: 'Theme    ', c: 't-accent' }, getTheme()],
        [{ t: 'Uptime   ', c: 't-accent' }, `${uptime}s (since you arrived)`],
      ];
      info.forEach((segments, i) => row({ t: pad(art[i] ?? '', 12), c: 't-accent' }, ...segments));
    },
    whoami: () => row('guest — but I’m glad you’re here.'),
    date: () => row(new Date().toString()),
    echo: (args) => row(args.join(' ')),
    sudo: () => row({ t: 'guest is not in the sudoers file. This incident will be reported.', c: 't-err' }),
    hello: () => row('Hello! Try ', { t: 'ls', c: 't-accent' }, '.'),
    rm: () => row({ t: 'rm: nice try. Nothing here gets deleted.', c: 't-warn' }),
  };

  const names = [...Object.keys(commands), ...Object.keys(hidden)];

  /* ----------------------------------------------------------------------
     Input handling
     ---------------------------------------------------------------------- */
  const tokenize = (line: string): string[] => line.match(/"[^"]*"|'[^']*'|\S+/g)?.map((token) => token.replace(/^["']|["']$/g, '')) ?? [];

  const execute = (line: string) => {
    row({ t: `${promptText()} `, c: 't-ok' }, line);
    const [name = '', ...args] = tokenize(line);
    if (!name) return;
    // hasOwn: names like `constructor` must not resolve to Object.prototype members.
    const command = Object.hasOwn(commands, name) ? commands[name] : undefined;
    const extra = Object.hasOwn(hidden, name) ? hidden[name] : undefined;
    if (command) command.run(args);
    else if (extra) extra(args);
    else row({ t: `zsh: command not found: ${name}`, c: 't-err' }, { t: '   (try help)', c: 't-dim' });
  };

  const complete = () => {
    const value = input.value;
    const parts = value.split(/\s+/);
    const last = parts[parts.length - 1] ?? '';
    const pool = parts.length === 1 ? names : ['cat', 'open', 'cd'].includes(parts[0] ?? '') ? [...projects.map((p) => p.slug), 'github', 'notes', 'mail', 'contacts'] : [];
    const matches = pool.filter((entry) => entry.startsWith(last.toLowerCase()));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0] ?? last;
      input.value = `${parts.join(' ')} `;
    } else if (matches.length > 1) {
      row({ t: `${promptText()} `, c: 't-ok' }, value);
      row({ t: matches.join('   '), c: 't-dim' });
      scrollDown();
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const line = input.value.trim();
    input.value = '';
    if (line) {
      history.push(line);
      cursor = history.length;
    }
    execute(line);
    scrollDown();
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor] ?? '';
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? '';
    } else if (event.key === 'Tab' && input.value.trim()) {
      // Only complete when there's something to complete, so Tab never traps keyboard focus.
      event.preventDefault();
      complete();
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      out.replaceChildren();
    }
  });

  // Click anywhere in the screen to type, unless the visitor is selecting text.
  screen.addEventListener('click', (event) => {
    if (window.getSelection()?.toString() || (event.target as Element).closest('a')) return;
    input.focus();
  });

  document.addEventListener('wm:change', (event) => {
    const { type, id } = (event as CustomEvent<WindowEvent>).detail;
    if (id === 'terminal' && (type === 'open' || type === 'restore')) window.setTimeout(() => input.focus({ preventScroll: true }), 60);
  });

  /* ----------------------------------------------------------------------
     Welcome
     ---------------------------------------------------------------------- */
  row({ t: 'This is a real, working terminal — entirely optional. ', c: 't-strong' }, { t: 'Everything here is also a click away in Finder, Notes, or Mail.', c: 't-dim' });
  row('Type ', { t: 'help', c: 't-accent' }, ' for the full list, or just start with ', { t: 'ls', c: 't-accent' }, '.');
  blank();
}
