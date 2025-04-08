
interface SignatureProps {
  signatures?: any[]
}

const SignatureArea = ({ signatures = [] }: SignatureProps) => {
  return (
    <div className="signature-area">
      <div className="signature-block">
        <div className="signature-line">
          {signatures && signatures[0] ? (
            <img 
              src={signatures[0].imageUrl} 
              alt="First Party Signature" 
              className="h-full object-contain"
            />
          ) : null}
        </div>
        <div className="signature-name">First Party</div>
      </div>
      
      <div className="signature-block">
        <div className="signature-line">
          {signatures && signatures[1] ? (
            <img 
              src={signatures[1].imageUrl} 
              alt="Second Party Signature" 
              className="h-full object-contain"
            />
          ) : null}
        </div>
        <div className="signature-name">Second Party</div>
      </div>
    </div>
  );
};

export default SignatureArea;
