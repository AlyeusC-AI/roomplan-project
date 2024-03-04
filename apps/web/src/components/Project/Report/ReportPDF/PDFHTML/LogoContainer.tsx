/* eslint-disable @next/next/no-img-element */
const LogoContainer = ({
  logoId,
  publicId,
}: {
  logoId: string
  publicId: string
}) => (
  <div className="pdf logo-container">
    <img
      style={{ height: '18px' }}
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/org-pictures/${publicId}/${logoId}.png`}
      alt="company logo"
    />
  </div>
)

export default LogoContainer
