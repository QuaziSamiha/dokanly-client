/**
 * Classes for every home content modal (passed as CustomModal2's dialogHeight).
 * The dialog itself is the only scroll area, capped to the viewport and using
 * the branded scrollbar, the same as View Product. `p-0` drops the dialog's
 * own padding: the form inside brings its `p-4 sm:p-6`, which the sticky ModalHeader
 * is built around. Forms must not add their own max-height or overflow, or a
 * second scrollbar appears.
 *
 * `grid-cols-1` (one minmax(0, 1fr) column) stops a long unbreakable value,
 * such as an uploaded file name, from stretching the dialog’s grid wider than
 * the modal, which clipped the right edge of every field.
 *
 * Kept out of home-admin.constants.tsx, which imports the table components
 * that use this.
 */
export const HOME_MODAL_DIALOG_CLASS =
  "p-0 grid-cols-1 max-h-[min(85vh,calc(100dvh-7rem))] sm:max-h-[min(80vh,calc(100dvh-7rem))] scrollbar-brand";

/**
 * Modal width for every home content modal (CustomModal2's dialogWidth):
 * full width minus a 12px gutter on each side on phones (the shared dialog
 * sets no max-width of its own), 42rem on tablets, and
 * on desktops the original 60vw (never narrower than 42rem).
 */
export const HOME_MODAL_DIALOG_WIDTH =
  "w-full max-w-[calc(100%-1.5rem)] sm:max-w-2xl lg:max-w-[max(42rem,60vw)]";
