/** How public prices describe tax: "before GST" once 360VUE is GST-registered, "no GST" until then. */
export const taxNote = (gstOn: boolean) => (gstOn ? "before GST" : "no GST");
