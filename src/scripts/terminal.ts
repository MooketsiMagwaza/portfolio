import { appById, type AppId } from '@/data/apps';
import { projects, type Project } from '@/data/projects';
import { principles, profile, stackGroups } from '@/data/site';
import * as actions from './actions';
import { must } from './lib';
import { getTheme, setTheme } from './theme';
import { closeApp, type WindowEvent } from './windows';

/** A piece of a terminal line: plain text, coloured text, or a link. */
type Seg = string | { t: string; c?: string; href?: string };

type Command = { usage: string; desc: string; run: (args: string[]) => void };

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

  const history: string[] = [];
  let cursor = 0;
  const started = performance.now();

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

  /* ----------------------------------------------------------------------
     Commands
     ---------------------------------------------------------------------- */
  const commands: Record<string, Command> = {
    help: {
      usage: 'help',
      desc: 'list what you can do here',
      run: () => {
        row({ t: 'Commands', c: 't-strong' });
        Object.values(commands).forEach((command) => row('  ', { t: pad(command.usage, 22), c: 't-accent' }, { t: command.desc, c: 't-dim' }));
        blank();
        row({ t: 'Tip: ', c: 't-dim' }, 'press Tab to complete, ↑ for history.');
      },
    },
    about: {
      usage: 'about',
      desc: 'who I am',
      run: () => {
        row({ t: profile.headline, c: 't-strong' });
        row(profile.intro);
        blank();
        row({ t: 'role     ', c: 't-dim' }, profile.role);
        row({ t: 'based in ', c: 't-dim' }, profile.location);
        row({ t: 'focus    ', c: 't-dim' }, profile.focus.join(' · '));
      },
    },
    ls: {
      usage: 'ls',
      desc: 'list my projects',
      run: () => {
        row({ t: `total ${projects.length}`, c: 't-dim' });
        projects.forEach((p) => row({ t: pad(p.filename, 30), c: 't-accent' }, { t: p.kind, c: 't-dim' }));
        blank();
        row({ t: 'Try: ', c: 't-dim' }, 'cat zenith', { t: '  or  ', c: 't-dim' }, 'open zenith');
      },
    },
    cat: {
      usage: 'cat <project>',
      desc: 'read about a project',
      run: (args) => {
        if (!args.length) return row({ t: 'usage: cat <project>   (try: ls)', c: 't-warn' });
        const project = findProject(args.join(' '));
        if (!project) return row({ t: `cat: ${args.join(' ')}: No such file or directory`, c: 't-err' });
        row({ t: project.name, c: 't-strong' }, { t: `  ·  ${project.kind}`, c: 't-dim' });
        row({ t: project.kicker, c: 't-accent' });
        blank();
        row(project.story);
        blank();
        row({ t: 'built with  ', c: 't-dim' }, project.stack.join(' · '));
        row({ t: 'evidence    ', c: 't-dim' }, project.evidence);
        if (project.next) row({ t: 'next        ', c: 't-dim' }, project.next);
        row({ t: 'screens     ', c: 't-dim' }, `${project.shots.length} (open ${project.slug} to browse them)`);
        row({ t: 'source      ', c: 't-dim' }, { t: project.repository, href: project.repository });
      },
    },
    open: {
      usage: 'open <name>',
      desc: 'open a project or app',
      run: (args) => {
        const target = args.join(' ').trim();
        if (!target) return row({ t: 'usage: open <project|notes|mail|contacts|github>', c: 't-warn' });
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
        row({ t: `open: ${target}: not found`, c: 't-err' });
      },
    },
    stack: {
      usage: 'stack',
      desc: 'what I build with',
      run: () => stackGroups.forEach((group) => row({ t: pad(group.label, 20), c: 't-accent' }, group.items.join(' · '))),
    },
    principles: {
      usage: 'principles',
      desc: 'how I work',
      run: () => {
        principles.forEach((principle, i) => {
          row({ t: `${i + 1}. ${principle.title}`, c: 't-strong' });
          row('   ', { t: principle.body, c: 't-dim' });
        });
      },
    },
    contact: {
      usage: 'contact',
      desc: 'ways to reach me',
      run: () => {
        row({ t: 'email   ', c: 't-dim' }, { t: profile.email, href: `mailto:${profile.email}` });
        row({ t: 'github  ', c: 't-dim' }, { t: profile.github, href: profile.github });
        row({ t: 'where   ', c: 't-dim' }, profile.location);
        blank();
        row({ t: profile.invitation, c: 't-dim' });
      },
    },
    neofetch: {
      usage: 'neofetch',
      desc: 'the usual',
      run: () => {
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
    },
    theme: {
      usage: 'theme [light|dark]',
      desc: 'change appearance',
      run: ([choice]) => {
        const next = choice === 'light' || choice === 'dark' ? choice : getTheme() === 'dark' ? 'light' : 'dark';
        setTheme(next);
        row('Appearance set to ', { t: next, c: 't-accent' }, '.');
      },
    },
    whoami: { usage: 'whoami', desc: 'a fair question', run: () => row('guest — but I’m glad you’re here.') },
    date: { usage: 'date', desc: 'the date and time', run: () => row(new Date().toString()) },
    history: {
      usage: 'history',
      desc: 'what you’ve typed',
      run: () => history.forEach((entry, i) => row({ t: pad(String(i + 1), 5), c: 't-dim' }, entry)),
    },
    clear: { usage: 'clear', desc: 'clear the screen', run: () => out.replaceChildren() },
    exit: { usage: 'exit', desc: 'close this window', run: () => closeApp('terminal') },
  };

  // Hidden extras: not listed in `help`, but cheap to be nice about.
  const hidden: Record<string, (args: string[]) => void> = {
    pwd: () => row('/Users/guest'),
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
    row({ t: 'guest@mooketsi ~ % ', c: 't-ok' }, line);
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
    const pool = parts.length === 1 ? names : ['cat', 'open'].includes(parts[0] ?? '') ? [...projects.map((p) => p.slug), 'github', 'notes', 'mail', 'contacts'] : [];
    const matches = pool.filter((entry) => entry.startsWith(last.toLowerCase()));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0] ?? last;
      input.value = `${parts.join(' ')} `;
    } else if (matches.length > 1) {
      row({ t: 'guest@mooketsi ~ % ', c: 't-ok' }, value);
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
  row({ t: `Last login: ${new Date().toDateString()} on ttys000`, c: 't-dim' });
  row('Welcome to ', { t: 'mOS', c: 't-strong' }, ' — a portfolio, as a desktop.');
  row('Type ', { t: 'help', c: 't-accent' }, ' to see what you can do, or start with ', { t: 'ls', c: 't-accent' }, '.');
  blank();

}
