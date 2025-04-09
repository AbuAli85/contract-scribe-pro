
interface SignatureProps {
  signatures?: any[]
}

const SignatureArea = ({ signatures = [] }: SignatureProps) => {
  return (
    <div className="signature-area flex justify-between mt-10 mb-6 pt-5">
      <div className="signature-block flex-1 mr-6 border-t border-gray-300">
        <div className="signature-line h-16 my-3">
          {signatures && signatures[0] ? (
            <img 
              src={signatures[0].imageUrl} 
              alt="First Party Signature" 
              className="h-full object-contain"
            />
          ) : null}
        </div>
        <div className="signature-name font-semibold">First Party / الطرف الأول</div>
      </div>
      
      <div className="signature-block flex-1 ml-6 border-t border-gray-300">
        <div className="signature-line h-16 my-3">
          {signatures && signatures[1] ? (
            <img 
              src={signatures[1].imageUrl} 
              alt="Second Party Signature" 
              className="h-full object-contain"
            />
          ) : null}
        </div>
        <div className="signature-name font-semibold">Second Party / الطرف الثاني</div>
      </div>
    </div>
  );
};

export default SignatureArea;
