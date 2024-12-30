import BlurImage from '@components/DesignSystem/BlurImage'
import useSupabaseImage from '@utils/hooks/useSupabaseImage'

const ProjectListImage = ({ path }: { path: string }) => {
  const supabaseImage = useSupabaseImage(path)
  if (!supabaseImage) return null
  return <BlurImage sizes="250px" src={supabaseImage} alt="" />
}

export default ProjectListImage
