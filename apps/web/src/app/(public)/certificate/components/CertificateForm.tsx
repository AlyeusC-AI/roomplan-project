import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CertificateFormData, WorkOrderFormData } from "../types/certificate";
import { DocumentType } from "@service-geek/api-client";

interface CertificateFormProps {
  formData: CertificateFormData;
  onFormDataChange: (data: Partial<CertificateFormData>) => void;
  errors?: Record<string, string>;
}

export const CertificateForm = ({
  formData,
  onFormDataChange,
  errors,
}: CertificateFormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFormDataChange({ [name]: value });
  };

  const renderWorkOrderFields = () => {
    if (formData.type !== DocumentType.AUTH) return null;
    const workOrderData = formData as WorkOrderFormData;

    return (
      <div className='space-y-4'>
        {/* Row 1: Client Name and Insurance Company */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-sm'>Client Name:</Label>
            <Input
              name='customerName'
              value={workOrderData.customerName}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., Grigore Alii'
            />
            {errors?.customerName && (
              <p className='text-sm text-red-500'>{errors.customerName}</p>
            )}
          </div>
          <div>
            <Label className='text-sm'>Insurance Company:</Label>
            <Input
              name='insuranceCompany'
              value={workOrderData.insuranceCompany}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., Stillwater'
            />
            {errors?.insuranceCompany && (
              <p className='text-sm text-red-500'>{errors.insuranceCompany}</p>
            )}
          </div>
        </div>

        {/* Row 2: Address and Claim Number */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-sm'>Address:</Label>
            <Input
              name='address'
              value={workOrderData.address}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., 11325 Birch Springs Drive'
            />
            {errors?.address && (
              <p className='text-sm text-red-500'>{errors.address}</p>
            )}
          </div>
          <div>
            <Label className='text-sm'>Claim Number:</Label>
            <Input
              name='claimNumber'
              value={workOrderData.claimNumber}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., HO0001095682'
            />
            {errors?.claimNumber && (
              <p className='text-sm text-red-500'>{errors.claimNumber}</p>
            )}
          </div>
        </div>

        {/* Row 3: City and Policy Number */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-sm'>City:</Label>
            <Input
              name='city'
              value={workOrderData.city}
              onChange={handleInputChange}
              className='border-b border-gray-300'
            />
            {errors?.city && (
              <p className='text-sm text-red-500'>{errors.city}</p>
            )}
          </div>
          <div>
            <Label className='text-sm'>Policy Number:</Label>
            <Input
              name='policyNumber'
              value={workOrderData.policyNumber}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., PN2047779'
            />
            {errors?.policyNumber && (
              <p className='text-sm text-red-500'>{errors.policyNumber}</p>
            )}
          </div>
        </div>

        {/* Row 4: State, Zip, and Loss Type */}
        <div className='grid grid-cols-4 gap-4'>
          <div>
            <Label className='text-sm'>State:</Label>
            <Input
              name='state'
              value={workOrderData.state}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              maxLength={2}
              placeholder='TX'
            />
            {errors?.state && (
              <p className='text-sm text-red-500'>{errors.state}</p>
            )}
          </div>
          <div>
            <Label className='text-sm'>Zip:</Label>
            <Input
              name='zip'
              value={workOrderData.zip}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              maxLength={5}
              placeholder='37932'
            />
            {errors?.zip && (
              <p className='text-sm text-red-500'>{errors.zip}</p>
            )}
          </div>
          <div className='col-span-2'>
            <Label className='text-sm'>Loss Type:</Label>
            <Input
              name='lossType'
              value={workOrderData.lossType}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., Fire'
            />
            {errors?.lossType && (
              <p className='text-sm text-red-500'>{errors.lossType}</p>
            )}
          </div>
        </div>

        {/* Row 5: Phone Number and Date of Loss */}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-sm'>Phone Number:</Label>
            <Input
              name='phoneNumber'
              value={workOrderData.phoneNumber}
              onChange={handleInputChange}
              className='border-b border-gray-300'
              placeholder='e.g., 865-771-2013'
            />
            {errors?.phoneNumber && (
              <p className='text-sm text-red-500'>{errors.phoneNumber}</p>
            )}
          </div>
          <div>
            <Label className='text-sm'>Date of Loss:</Label>
            <Input
              name='dateOfLoss'
              type='date'
              value={workOrderData.dateOfLoss}
              onChange={handleInputChange}
              className='border-b border-gray-300'
            />
            {errors?.dateOfLoss && (
              <p className='text-sm text-red-500'>{errors.dateOfLoss}</p>
            )}
          </div>
        </div>

        {/* Row 6: Email Address */}
        <div>
          <Label className='text-sm'>Email Address:</Label>
          <Input
            name='email'
            type='email'
            value={workOrderData.email}
            onChange={handleInputChange}
            className='border-b border-gray-300'
            placeholder='e.g., Flooring.Grigore@gmail.com'
          />
          {errors?.email && (
            <p className='text-sm text-red-500'>{errors.email}</p>
          )}
        </div>

        {/* Row 7: Representative Name */}
        <div>
          <Label className='text-sm'>Representative Name:</Label>
          <Input
            name='representativeName'
            value={workOrderData.representativeName}
            onChange={handleInputChange}
            className='border-b border-gray-300'
            placeholder='e.g., Danielle Sago'
          />
          {errors?.representativeName && (
            <p className='text-sm text-red-500'>{errors.representativeName}</p>
          )}
        </div>

        {/* Row 8: Date */}
        <div>
          <Label className='text-sm'>Date:</Label>
          <Input
            type='date'
            name='date'
            value={workOrderData.date}
            onChange={handleInputChange}
            className='border-b border-gray-300'
          />
          {errors?.date && (
            <p className='text-sm text-red-500'>{errors.date}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {formData.type === DocumentType.AUTH ? (
        renderWorkOrderFields()
      ) : (
        <>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label className='text-sm'>Customer Name:</Label>
              <Input
                name='customerName'
                value={formData.customerName}
                onChange={handleInputChange}
                className='border-b border-gray-300'
              />
              {errors?.customerName && (
                <p className='text-sm text-red-500'>{errors.customerName}</p>
              )}
            </div>
            <div>
              <Label className='text-sm'>Cell Phone:</Label>
              <Input
                name='cellPhone'
                value={formData.cellPhone}
                onChange={handleInputChange}
                className='border-b border-gray-300'
              />
              {errors?.cellPhone && (
                <p className='text-sm text-red-500'>{errors.cellPhone}</p>
              )}
            </div>
          </div>

          <div>
            <Label className='text-sm'>Address:</Label>
            <Input
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              className='border-b border-gray-300'
            />
            {errors?.address && (
              <p className='text-sm text-red-500'>{errors.address}</p>
            )}
          </div>

          <div>
            <Label className='text-sm'>Insurance Company:</Label>
            <Input
              name='insuranceCompany'
              value={formData.insuranceCompany}
              onChange={handleInputChange}
              className='border-b border-gray-300'
            />
            {errors?.insuranceCompany && (
              <p className='text-sm text-red-500'>{errors.insuranceCompany}</p>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <Label className='text-sm'>Claim Number:</Label>
              <Input
                name='claimNumber'
                value={formData.claimNumber}
                onChange={handleInputChange}
                className='border-b border-gray-300'
              />
              {errors?.claimNumber && (
                <p className='text-sm text-red-500'>{errors.claimNumber}</p>
              )}
            </div>
            <div>
              <Label className='text-sm'>Policy Number:</Label>
              <Input
                name='policyNumber'
                value={formData.policyNumber}
                onChange={handleInputChange}
                className='border-b border-gray-300'
              />
              {errors?.policyNumber && (
                <p className='text-sm text-red-500'>{errors.policyNumber}</p>
              )}
            </div>
          </div>

          <div>
            <Label className='text-sm'>Date:</Label>
            <Input
              type='date'
              name='date'
              value={formData.date}
              onChange={handleInputChange}
              className='border-b border-gray-300'
            />
            {errors?.date && (
              <p className='text-sm text-red-500'>{errors.date}</p>
            )}
          </div>

          <div>
            <Label className='text-sm'>Representative Name:</Label>
            <Input
              name='representativeName'
              value={formData.representativeName}
              onChange={handleInputChange}
              className='border-b border-gray-300'
            />
            {errors?.representativeName && (
              <p className='text-sm text-red-500'>
                {errors.representativeName}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
