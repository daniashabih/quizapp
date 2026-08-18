import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectLevel() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/technologies', { replace: true });
    }, [navigate]);

    return null;
}


