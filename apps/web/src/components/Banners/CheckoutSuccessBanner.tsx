import Banner from '@components/DesignSystem/Banner'

const CheckoutSuccessBanner = () => {
  return (
    <Banner title="Thank you for your purchase!" variant="success">
      <div>
        <>Looking to learn more about how to maximize ServiceGeek?</>
        <ol className="ml-8 list-disc">
          <li className="list-item underline">
            <a href="https://knowledge.servicegeek.app/" target="_blank">
              Checkout the documentation
            </a>
          </li>
          <li className="list-item">Download the servicegeek companion app</li>
        </ol>
      </div>
    </Banner>
  )
}

export default CheckoutSuccessBanner
