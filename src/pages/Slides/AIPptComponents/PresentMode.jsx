/**
 * Present (the slideshow). The editor, the public share page and the Present harness open this.
 *
 * It lives in ./present/ (Present plan P1, docs/PRESENT_MODE_PRODUCTION_PLAN.md):
 *   AudienceView    what the audience sees: the slide edge to edge, a toolbar that hides
 *   SlideshowStage  one slide drawn by the editor's renderer, letterboxed to its box
 *   useSlideshow    the show's state (slide, transition, following a live presenter)
 *   slideshowKeys   the key map; fullscreen: the browser's full screen
 */
export { default } from './present/AudienceView'
