import { getStyleCssPath } from '../utils/PathHelper';

export function loadStyles() {
	const linkEl = document.createElement('link');
	linkEl.rel = 'stylesheet';
	linkEl.type = 'text/css';
	linkEl.href = getStyleCssPath()  // Adjust if needed
	document.head.appendChild(linkEl);
}
