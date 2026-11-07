// 📖 Docs: obsidian/frontend/components/animation-springs.md
import { Tags } from "@/types/springs";
import { animated } from "@react-spring/web";
import {
  CSSProperties,
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useRef,
} from "react";

export interface VarTextTagProps {
  tag?: Tags;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
export const AnimatedVarTextTag = forwardRef<HTMLElement, VarTextTagProps>(
  ({ tag = "span", children, className, style, ...props }, outerRef) => {
    const ref = useRef<HTMLElement | null>(null);
    useImperativeHandle(outerRef, () => ref.current as HTMLElement);
    // React 19's types collapse a dynamic `ElementType` JSX tag to `never`
    // props (the intrinsic ∩ component intersection), so the spread/ref/
    // children below stop type-checking. The runtime value is always a valid
    // animated element, so widen the dynamic tag here.
    const Tag = (animated as any)[tag];

    return (
      <Tag ref={ref} className={className} style={style} {...props}>
        {children}
      </Tag>
    );
  },
);
AnimatedVarTextTag.displayName = "AnimatedVarTextTag";
