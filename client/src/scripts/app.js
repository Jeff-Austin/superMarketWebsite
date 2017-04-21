import foo from './foo';
import template from '../templates/foo.hbs';

document.querySelector('#container').innerHTML = template({ name: 'Jeff!' });
