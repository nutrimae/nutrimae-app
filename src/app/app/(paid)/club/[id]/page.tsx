import { PostDetail } from "./post-detail";

export default async function ClubPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostDetail postId={id} />;
}
