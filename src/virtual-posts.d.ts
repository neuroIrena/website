declare module "virtual:posts" {
  const posts: import("./lib/post-types").Post[];
  export default posts;
}
