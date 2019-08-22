/**
 *  @author scrubs / https://www.mecabricks.com
 */

import { TempNode } from '../core/TempNode';
import { FunctionNode } from '../core/FunctionNode';
import { NormalNode } from '../accessors/NormalNode';
import { PositionNode } from '../accessors/PositionNode';

class TriplanarMapNode extends TempNode {
    constructor(texture, scale);

    generate(builder, output): string;
}

export { TriplanarMapNode };
