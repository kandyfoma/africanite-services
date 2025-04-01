import * as React from 'react';

declare module "*.jsx" {
    const content: React.ComponentType<any>;
    export default content;
}