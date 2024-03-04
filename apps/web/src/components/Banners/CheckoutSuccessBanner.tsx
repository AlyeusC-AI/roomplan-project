import Banner from '@components/DesignSystem/Banner'

const CheckoutSuccessBanner = () => {
  return (
    <Banner title="Thank you for your purchase!" variant="success">
      <div>
        <>Looking to learn more about how to maximize RestorationX?</>
        <ol className="ml-8 list-disc">
          <li className="list-item underline">
            <a href="https://knowledge.restorationx.app/" target="_blank">
              Checkout the documentation
            </a>
          </li>
          <li className="list-item">Download the identishot companion app</li>
        </ol>
      </div>
    </Banner>
  )
}

export default CheckoutSuccessBanner
