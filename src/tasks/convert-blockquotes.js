import { createEl, result } from './task-utils.js'

/**
 * TODO: How to make this configurable?
 * Converts:
 * <q class="quote i">Lorem ipsum</p>
 * <q class="quote-src">-Lorem</p>
 *
 * To:
 * <figure>
 *   <blockquote class="i">Lorem ipsum<blockquote>
 *   <figcaption>-Lorem</figcaption>
 * </figure>
 */
const convert_blockquotes = {
  name: 'convert-blockquotes',
  selector: 'p.quote',
  transform: ($, node) => {
    let results = result();
    let next = node.nextElementSibling;
    let src = null;

    if (next.tagName === 'P' && next.classList.contains('quote-src')) {
      src = next.innerHTML;
      results.remove(next);
    }

    let tmpl = `<figure>
  <blockquote class="i">${node.textContent.trim()}</blockquote>
  ${ src ? `<figcaption>${src}</figcaption>` : '' }
</figure>`

    return results.replace(node, createEl($, tmpl)).final();
  }
}

export default convert_blockquotes;
