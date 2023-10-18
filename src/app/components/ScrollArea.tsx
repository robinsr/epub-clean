import React, { ReactNode, useEffect, useRef } from 'react';
import { Box, measureElement, useInput } from 'ink';

const reducer = (state, action) => {
	switch (action.type) {
		case 'SET_INNER_HEIGHT':
			return {
				...state,
				innerHeight: action.innerHeight
			};

		case 'SCROLL_DOWN':
			return {
				...state,
				scrollTop: Math.min(
					state.innerHeight - state.height,
					state.scrollTop + 1
				)
			};

		case 'SCROLL_UP':
			return {
				...state,
				scrollTop: Math.max(0, state.scrollTop - 1)
			};

		default:
			return state;
	}
};


type ScrollAreaProps = {
  height: number;
  readonly children: ReactNode;
}
const ScrollArea:React.FC<ScrollAreaProps> = ({ height, children }) => {
	const [state, dispatch] = React.useReducer(reducer, {
		height,
		scrollTop: 0
	});

	const innerRef = useRef();

	useEffect(() => {
		const dimensions = measureElement(innerRef.current);

		dispatch({
			type: 'SET_INNER_HEIGHT',
			innerHeight: dimensions.height
		});
	}, []);

	useInput((_input, key) => {
		if (key.downArrow) {
			dispatch({
				type: 'SCROLL_DOWN'
			});
		}

		if (key.upArrow) {
			dispatch({
				type: 'SCROLL_UP'
			});
		}
	});

	return (
		<Box height={height} flexDirection="column" overflow="hidden">
			<Box
				ref={innerRef}
				flexShrink={0}
				flexDirection="column"
				marginTop={-state.scrollTop}
			>
				{children}
			</Box>
		</Box>
	);
}

export default ScrollArea;
