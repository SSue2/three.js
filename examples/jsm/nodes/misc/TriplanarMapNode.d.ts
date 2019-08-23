/**
 *  @author scrubs / https://www.mecabricks.com
 */

import { TempNode } from '../core/TempNode';
import { FunctionNode } from '../core/FunctionNode';
import { NormalNode } from '../accessors/NormalNode';
import { PositionNode } from '../accessors/PositionNode';

export class TriplanarMapNode extends TempNode {
    constructor(texture, scale, rotation);

    generate(builder, output): string;
}
