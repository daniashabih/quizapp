import React from 'react';

/**
 * Modern, accessible input component with prefix and suffix icon slots.
 * Guarantees zero overlapping between icons and text by using a flex container layout
 * rather than fragile absolute-positioned offsets.
 */
export default function InputField({
    label,
    labelRight,
    prefixIcon: PrefixIcon,
    suffix,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    autoComplete,
    autoFocus = false,
    disabled = false,
    error,
    className = '',
    inputClassName = '',
    id,
    name,
    ...rest
}) {
    return (
        <div className={`space-y-1 ${className}`}>
            {(label || labelRight) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <label htmlFor={id} className="input-label text-xs">
                            {label}
                        </label>
                    )}
                    {labelRight}
                </div>
            )}
            <div className={`input-group ${error ? 'has-error' : ''}`}>
                {PrefixIcon && (
                    <span className="input-prefix-icon" aria-hidden="true">
                        {React.isValidElement(PrefixIcon) ? PrefixIcon : <PrefixIcon size={16} />}
                    </span>
                )}
                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    disabled={disabled}
                    className={`input-core text-xs sm:text-sm ${inputClassName}`}
                    {...rest}
                />
                {suffix && (
                    <div className="input-suffix-wrapper flex items-center shrink-0">
                        {suffix}
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-[#EF4444] mt-1">{error}</p>}
        </div>
    );
}
