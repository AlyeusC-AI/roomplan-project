import BlurImage from "@components/DesignSystem/BlurImage";

const ProjectListImage = ({ path }: { path: string }) => {
  const supabaseImage = path;
  if (!supabaseImage) return null;
  return <BlurImage sizes='250px' src={supabaseImage} alt='' />;
};

export default ProjectListImage;
