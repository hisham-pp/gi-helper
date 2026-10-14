import { PageLoading } from "@/components/layout/PageLoading";

/**
 * Only this page renders on request (it reads the session cookie), so only it
 * gets a loading boundary. The static pages leave it out: a loading.tsx above
 * them put the placeholder into their prerendered HTML, shown before the page.
 */
export default PageLoading;
