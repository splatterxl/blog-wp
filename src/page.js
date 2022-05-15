import { createElement, updateDOM, title } from './util/dom.js';
import { query } from './util/query.js';
import { setURL, pushURL, navigate } from './router.js';
import { debug } from './util/logging.js';

export function createPage(pathname = location.pathname) {
	if (query.get('error')) {
		debug('render', 'paint error:', query.get('error'));
		return createErrorPage(query.get('error'));
	}

	const slug = getSlug(pathname);

	if (slug) {
		debug('render', 'paint article:', slug);
		return createArticlePage(slug);
	} else {
		debug('render', 'paint app home');
		return createHomePage();
	}
}

export function getSlug(path) {
	const pathname = path.slice(1).split('/');
	pathname.shift();

	if (pathname[0] === 'app' || pathname[0] === 'articles') {
		pathname.shift();
	}

	if (!pathname[0]) {
		pathname[0] = query.get('id');
	}

	return pathname[0];
}

export async function createArticlePage(slug, push = false) {
	const index = await fetch('/api/blog/list').then((res) => res.json());

	const article = index.find((article) => article.slug === slug);

	if (!article) {
		return createNotFoundPage();
	}

	const { name, author, created, modified } = article;
	// const content = await fetch(`/blog/content/${path}.md`).then(res => res.text());

	const heading = createElement('h1', {
		class: 'article-heading',
		text: name
	});
	const meta = createElement('p', {
		class: 'article-meta'
	});
	meta.appendChild(
		createElement('span', {
			class: 'article-author',
			text: author
		})
	);
	meta.appendChild(
		createElement(
			'span',
			{
				class: 'article-date'
			},
			[
				createElement('span', {
					class: 'article-date-on',
					text: ' on '
				}),
				createElement('span', {
					class: 'article-date-actual',
					text: new Date(created).toLocaleDateString(navigator.language, {
						dateStyle: 'medium'
					})
				})
			]
		)
	);

	if (modified && modified !== created) {
		meta.appendChild(
			createElement('span', {
				class: 'article-date-modified',
				text:
					' (last modified on ' +
					new Date(modified).toLocaleDateString(navigator.language, {
						dateStyle: 'medium'
					}) +
					')'
			})
		);
	}

	const header = createElement('header', null, [heading, meta]);

	updateDOM(header);
	title(name);

	(push ? pushURL : setURL)(`/articles/${slug}`);
}

export async function createHomePage() {
	const heading = createElement('h1', {
		class: 'home-heading',
		text: 'Welcome to my blog!'
	});
	const meta = createElement('p', {
		class: 'home-meta',
		text: 'This is a place where I write about my journey and experiences with the web.'
	});

	const header = createElement('header', null, [heading, meta]);

	const list = await createArticleList();

	updateDOM(header, list);
	title('Home');

	setURL('/');
}

export async function createArticleList() {
	const index = await fetch('/api/blog/list').then((res) => res.json());

	const list = index.map((article) => {
		const { name, slug } = article;
		const link = createElement(
			'a',
			{
				class: 'article-list-a',
				href: `/articles/${slug}`,
				onClick(event) {
					event.preventDefault();
					navigate(`/articles/${slug}`);
				}
			},
			[
				createElement(
					'li',
					{
						class: 'article-list-item'
					},
					[
						createElement('span', {
							class: 'article-list-name',
							text: name
						}),
						createElement('span', {
							class: 'article-list-sep',
							text: ' | '
						}),
						createElement('span', {
							class: 'article-list-date',
							text: new Date(article.created).toLocaleDateString(
								navigator.language,
								{
									dateStyle: 'medium'
								}
							)
						})
					]
				)
			]
		);

		return link;
	});

	return createElement(
		'ul',
		{
			class: 'article-list'
		},
		list
	);
}

export async function createNotFoundPage() {
	const heading = createElement('h1', {
		text: 'Not Found'
	});
	const meta = createElement('p', {
		text: 'The page you are looking for does not exist.'
	});

	const header = createElement('header', null, [heading, meta]);

	const list = createElement('main', null, [
		createElement('p', {
			text: 'While you wait, why not read one of these?'
		}),
		await createArticleList()
	]);

	updateDOM(header, list);
	title('Not Found');
}

export function createErrorPage(code) {
	switch (code) {
		case 'not-found':
		case '404': {
			return createNotFoundPage();
		}
		default: {
			const heading = createElement('h1', {
				text: 'Error'
			});
			const meta = createElement('p', {
				text: 'An error occurred. All I know: ' + code
			});

			const header = createElement('header', null, [heading, meta]);

			updateDOM(header);
			title('Error');

			break;
		}
	}
}
