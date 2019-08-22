/**
 *  @author scrubs / https://www.mecabricks.com
 */

import { TempNode } from '../core/TempNode';
import { FunctionNode } from '../core/FunctionNode';
import { NormalNode } from '../accessors/NormalNode';
import { PositionNode } from '../accessors/PositionNode';

export class TriplanarNormalMapNode extends TempNode {
    constructor(texture, scale, strength);

    generate(builder, output);
}
