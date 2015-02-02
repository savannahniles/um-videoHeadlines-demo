/*
 * $Id: shot.h 117 2007-03-05 14:11:26Z johmathe $
 * $Date: 2007-03-05 15:11:26 +0100 (Mon, 05 Mar 2007) $
 */

#ifndef __SHOT_H__
#define __SHOT_H__
#include "src/image.h"


class image;

class shot
{
private:
public:
  int myid;

  /* Dur�e en frame */
  int fduration;
  /* Stating point (frame) */
  int fbegin;
  /* Dur�e en ms */
  double msduration;
  /* D�but en ms */
  double msbegin;
  /* img */
  image *img_begin;
  image *img_end;
  shot ();
  ~shot ();
};

#endif /* !__SHOT_H__ */
